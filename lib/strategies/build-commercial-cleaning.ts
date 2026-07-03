import {
  mutate,
  searchStream,
  suggestStateGeoTarget,
  extractApiError,
} from '../google-ads';
import { getStateAbbr } from '../us-states';
import {
  AD_GROUPS,
  STRUCTURED_SNIPPET,
  CAMPAIGN_SITELINKS,
  MAX_HEADLINE,
  MAX_DESCRIPTION,
  buildPrimaryHeadline,
  renderText,
} from './commercial-cleaning-data';
import { NEGATIVE_LISTS } from './commercial-cleaning-negatives';

export interface BuildParams {
  customerId: string; // client account, digits only
  companyName: string;
  website: string; // final URL
  state: string; // US state name for geo-targeting
  city: string;
  dailyBudget: number; // USD
  adGroupKeys: string[]; // which of the 4 ad groups to build
  separatePages: boolean; // client has separate pages per service
}

export interface BuildResult {
  campaignResourceName: string;
  campaignName: string;
  steps: string[];
  warnings: string[];
}

function idFromResourceName(resourceName: string): string {
  return resourceName.split('/').pop() || '';
}

export async function buildCommercialCleaning(
  params: BuildParams
): Promise<BuildResult> {
  const {
    customerId,
    companyName,
    website,
    state,
    city,
    dailyBudget,
    adGroupKeys,
    separatePages,
  } = params;

  const cid = customerId.replace(/-/g, '');
  // Location token used in ads and in {location} keyword placeholders:
  //  - city selected -> the city
  //  - no city        -> the state
  const trimmedCity = city.trim();
  const locationString = trimmedCity || state;
  const stateAbbr = getStateAbbr(state);
  // Normalized base URL without trailing slash.
  const baseUrl = (
    website.startsWith('http') ? website : `https://${website}`
  ).replace(/\/+$/, '');
  // Sitelink / service URL: "/slug" when the client has separate pages,
  // otherwise "/#slug" (one-page site with anchors).
  const serviceUrl = (slug: string) =>
    separatePages ? `${baseUrl}/${slug}` : `${baseUrl}/#${slug}`;
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const steps: string[] = [];
  const warnings: string[] = [];

  const buildingSchool = adGroupKeys.includes('school');

  // 1) Campaign budget ------------------------------------------------------
  const [budget] = await mutate(cid, 'campaignBudgets', [
    {
      create: {
        name: `Commercial Cleaning Budget - ${stamp}`,
        amountMicros: String(Math.round(dailyBudget * 1_000_000)),
        deliveryMethod: 'STANDARD',
        explicitlyShared: false,
      },
    },
  ]);
  steps.push(`Orçamento criado (US$ ${dailyBudget}/dia)`);

  // 2) Campaign (PAUSED) ----------------------------------------------------
  const campaignName = `Commercial Cleaning - ${locationString} - ${stamp}`;
  const [campaign] = await mutate(cid, 'campaigns', [
    {
      create: {
        name: campaignName,
        status: 'PAUSED',
        advertisingChannelType: 'SEARCH',
        campaignBudget: budget.resourceName,
        // Maximize Conversions with no target CPA (empty strategy object)
        maximizeConversions: {},
        finalUrlSuffix:
          'utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}',
        containsEuPoliticalAdvertising:
          'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
        networkSettings: {
          targetGoogleSearch: true,
          targetSearchNetwork: true,
          targetContentNetwork: false,
          targetPartnerSearchNetwork: false,
        },
      },
    },
  ]);
  const campaignResourceName = campaign.resourceName;
  steps.push(`Campanha criada (PAUSADA): "${campaignName}"`);

  // 2b) Geo-targeting: target the selected US state -------------------------
  if (state) {
    try {
      const geoTarget = await suggestStateGeoTarget(state);
      if (geoTarget) {
        await mutate(cid, 'campaignCriteria', [
          {
            create: {
              campaign: campaignResourceName,
              location: { geoTargetConstant: geoTarget },
            },
          },
        ]);
        steps.push(`Segmentação geográfica: ${state}`);
      } else {
        warnings.push(`Não encontrei o estado "${state}" para segmentar.`);
      }
    } catch (e: any) {
      warnings.push(`Segmentação de "${state}" falhou (seguindo sem ela).`);
    }
  }

  // 2c) Campaign-specific conversion goals ----------------------------------
  // Make the campaign use only Submit Lead Form + Phone Call Leads as biddable
  // goals (instead of the account-default goals).
  try {
    const campaignId = idFromResourceName(campaignResourceName);
    const desired = new Set(['SUBMIT_LEAD_FORM', 'PHONE_CALL_LEAD']);

    const goals = await searchStream(
      cid,
      `SELECT customer_conversion_goal.category, customer_conversion_goal.origin
       FROM customer_conversion_goal`
    );

    const ops = goals.map((g: any) => {
      const category = g.customerConversionGoal.category;
      const origin = g.customerConversionGoal.origin;
      return {
        update: {
          resourceName: `customers/${cid}/campaignConversionGoals/${campaignId}~${category}~${origin}`,
          biddable: desired.has(category),
        },
        updateMask: 'biddable',
      };
    });

    if (ops.length) {
      await mutate(cid, 'campaignConversionGoals', ops);
      steps.push(
        'Metas de conversão da campanha: Submit lead forms + Phone call leads'
      );
    }
  } catch (e: any) {
    warnings.push(
      'Não foi possível definir as metas de conversão específicas (seguindo com as metas padrão da conta).'
    );
  }

  // 3) Structured snippet asset (campaign level) ----------------------------
  try {
    const [asset] = await mutate(cid, 'assets', [
      {
        create: {
          structuredSnippetAsset: {
            header: STRUCTURED_SNIPPET.header,
            values: STRUCTURED_SNIPPET.values,
          },
        },
      },
    ]);
    await mutate(cid, 'campaignAssets', [
      {
        create: {
          campaign: campaignResourceName,
          asset: asset.resourceName,
          fieldType: 'STRUCTURED_SNIPPET',
        },
      },
    ]);
    steps.push('Structured snippet adicionado (Services)');
  } catch (e: any) {
    warnings.push('Structured snippet não pôde ser criado (seguindo sem ele).');
  }

  // Sitelinks are added per ad group (6 each: 5 general + 1 service-specific),
  // not at campaign level — see the ad group loop below.

  // 4) Campaign-level negative keyword lists --------------------------------
  for (const list of NEGATIVE_LISTS) {
    let keywords = list.keywords;

    // Guard: don't let 'school'/'student' kill the School ad group
    if (buildingSchool) {
      const before = keywords.length;
      keywords = keywords.filter(
        (k) => !['school', 'student'].includes(k.toLowerCase())
      );
      if (keywords.length < before) {
        warnings.push(
          `Lista "${list.name}": removido 'school'/'student' para não bloquear o ad group School Cleaning.`
        );
      }
    }

    const sharedSetResourceName = await getOrCreateNegativeList(
      cid,
      list.name,
      keywords
    );
    await mutate(cid, 'campaignSharedSets', [
      {
        create: {
          campaign: campaignResourceName,
          sharedSet: sharedSetResourceName,
        },
      },
    ]);
    steps.push(`Lista negativa "${list.name}" (${keywords.length}) anexada`);
  }

  // 5) Ad groups, keywords, negatives, RSAs ---------------------------------
  const selected = AD_GROUPS.filter((ag) => adGroupKeys.includes(ag.key));
  for (const ag of selected) {
    const [adGroup] = await mutate(cid, 'adGroups', [
      {
        create: {
          name: ag.name,
          campaign: campaignResourceName,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD',
          // No cpcBidMicros: we don't set a max CPC on ad groups or keywords.
        },
      },
    ]);
    const adGroupRN = adGroup.resourceName;

    // Positive keywords ({location} placeholder resolved here)
    const keywordOps = ag.keywords.map((kw) => ({
      create: {
        adGroup: adGroupRN,
        status: 'ENABLED',
        keyword: {
          text: kw.text.replaceAll('{location}', locationString),
          matchType: kw.matchType,
        },
      },
    }));

    // State-abbreviation broad keywords (only when no city is selected)
    let abbrCount = 0;
    if (!trimmedCity && stateAbbr) {
      for (const tmpl of ag.abbrevKeywords) {
        keywordOps.push({
          create: {
            adGroup: adGroupRN,
            status: 'ENABLED',
            keyword: {
              text: tmpl.replaceAll('{abbr}', stateAbbr),
              matchType: 'BROAD',
            },
          },
        });
        abbrCount++;
      }
    }

    await mutate(cid, 'adGroupCriteria', keywordOps);

    // Ad-group-level cross negatives
    if (ag.negatives.length) {
      await mutate(
        cid,
        'adGroupCriteria',
        ag.negatives.map((kw) => ({
          create: {
            adGroup: adGroupRN,
            negative: true,
            keyword: { text: kw.text, matchType: kw.matchType },
          },
        }))
      );
    }

    // Responsive search ad.
    // Order: dynamic (company/location), keyword headlines (search-term match),
    // then benefit/CTA headlines. Deduplicated (case-insensitive), capped at 15.
    const renderKwHeadline = (tmpl: string) => {
      const withLoc = tmpl.replaceAll('{location}', locationString);
      if (withLoc.length <= MAX_HEADLINE) return withLoc;
      // Too long with the location: drop it and keep just the keyword
      return tmpl
        .replaceAll('{location}', '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_HEADLINE);
    };

    const rawHeadlines = [
      buildPrimaryHeadline(companyName, locationString, locationString),
      ...ag.keywordHeadlines.map(renderKwHeadline),
      ...ag.headlines,
    ];

    const seen = new Set<string>();
    const headlines: { text: string }[] = [];
    for (const h of rawHeadlines) {
      const text = h.slice(0, MAX_HEADLINE);
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      headlines.push({ text });
      if (headlines.length === 15) break;
    }

    const descriptions = ag.descriptions.map((d) => ({
      text: renderText(
        d,
        companyName,
        locationString,
        locationString,
        MAX_DESCRIPTION
      ),
    }));

    // When the client has separate pages per service, point the ad at that
    // service page; otherwise use the homepage.
    const adFinalUrl = separatePages ? `${baseUrl}/${ag.slug}` : baseUrl;

    await mutate(cid, 'adGroupAds', [
      {
        create: {
          adGroup: adGroupRN,
          status: 'ENABLED',
          ad: {
            finalUrls: [adFinalUrl],
            responsiveSearchAd: { headlines, descriptions },
          },
        },
      },
    ]);

    // Sitelinks for this ad group: 5 general + the service-specific one (6th).
    // All at ad-group level so this ad group shows its own set. Counts come
    // from the actual API responses (ground truth, not hardcoded).
    let assetCount = 0;
    let linkCount = 0;
    try {
      const agSitelinks = [
        ...CAMPAIGN_SITELINKS.map((sl) => ({
          text: sl.text,
          url: serviceUrl(sl.slug),
        })),
        { text: ag.sitelinkText, url: serviceUrl(ag.slug) },
      ];
      const slAssets = await mutate(
        cid,
        'assets',
        agSitelinks.map((sl) => ({
          create: {
            finalUrls: [sl.url],
            sitelinkAsset: { linkText: sl.text },
          },
        }))
      );
      assetCount = slAssets.length;
      const linkResults = await mutate(
        cid,
        'adGroupAssets',
        slAssets.map((a) => ({
          create: {
            adGroup: adGroupRN,
            asset: a.resourceName,
            fieldType: 'SITELINK',
          },
        }))
      );
      linkCount = linkResults.length;
    } catch (e: any) {
      warnings.push(`Sitelinks de ${ag.name}: ${extractApiError(e).message}`);
    }

    steps.push(
      `${ag.name}: ${ag.keywords.length + abbrCount} keywords, ${ag.negatives.length} negativas, 1 RSA, sitelinks: ${assetCount} assets / ${linkCount} links`
    );
  }

  return { campaignResourceName, campaignName, steps, warnings };
}

/**
 * Returns the resource name of a negative keyword shared set with the given
 * name, reusing an existing one if present (account-level) or creating it and
 * populating its keywords (all BROAD).
 */
async function getOrCreateNegativeList(
  cid: string,
  name: string,
  keywords: string[]
): Promise<string> {
  const existing = await searchStream(
    cid,
    `SELECT shared_set.resource_name, shared_set.name
     FROM shared_set
     WHERE shared_set.name = '${name.replace(/'/g, "\\'")}'
       AND shared_set.status != 'REMOVED'
       AND shared_set.type = 'NEGATIVE_KEYWORDS'`
  );

  if (existing.length > 0) {
    return existing[0].sharedSet.resourceName;
  }

  const [sharedSet] = await mutate(cid, 'sharedSets', [
    { create: { name, type: 'NEGATIVE_KEYWORDS' } },
  ]);

  // Add the keywords to the shared set (BROAD). Chunk to stay under limits.
  const chunkSize = 1000;
  for (let i = 0; i < keywords.length; i += chunkSize) {
    const chunk = keywords.slice(i, i + chunkSize);
    await mutate(
      cid,
      'sharedCriteria',
      chunk.map((text) => ({
        create: {
          sharedSet: sharedSet.resourceName,
          keyword: { text, matchType: 'BROAD' },
        },
      }))
    );
  }

  return sharedSet.resourceName;
}
