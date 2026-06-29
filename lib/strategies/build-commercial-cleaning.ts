import { mutate, searchStream } from '../google-ads';
import {
  AD_GROUPS,
  STRUCTURED_SNIPPET,
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
  city: string;
  includeRegion: boolean;
  dailyBudget: number; // USD
  adGroupKeys: string[]; // which of the 4 ad groups to build
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
    city,
    includeRegion,
    dailyBudget,
    adGroupKeys,
  } = params;

  const cid = customerId.replace(/-/g, '');
  const locationString = includeRegion ? `${city} and region` : city;
  const finalUrl = website.startsWith('http') ? website : `https://${website}`;
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
  const campaignName = `Commercial Cleaning - ${city} - ${stamp}`;
  const [campaign] = await mutate(cid, 'campaigns', [
    {
      create: {
        name: campaignName,
        status: 'PAUSED',
        advertisingChannelType: 'SEARCH',
        campaignBudget: budget.resourceName,
        manualCpc: { enhancedCpcEnabled: false },
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
          cpcBidMicros: '2000000', // $2.00 default bid
        },
      },
    ]);
    const adGroupRN = adGroup.resourceName;

    // Positive keywords
    await mutate(
      cid,
      'adGroupCriteria',
      ag.keywords.map((kw) => ({
        create: {
          adGroup: adGroupRN,
          status: 'ENABLED',
          keyword: { text: kw.text, matchType: kw.matchType },
        },
      }))
    );

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

    // Responsive search ad
    const headlines = [
      buildPrimaryHeadline(companyName, city, locationString),
      ...ag.headlines,
    ]
      .map((h) => h.slice(0, MAX_HEADLINE))
      .map((text) => ({ text }));

    const descriptions = ag.descriptions.map((d) => ({
      text: renderText(d, companyName, city, locationString, MAX_DESCRIPTION),
    }));

    await mutate(cid, 'adGroupAds', [
      {
        create: {
          adGroup: adGroupRN,
          status: 'ENABLED',
          ad: {
            finalUrls: [finalUrl],
            responsiveSearchAd: { headlines, descriptions },
          },
        },
      },
    ]);

    steps.push(
      `${ag.name}: ${ag.keywords.length} keywords, ${ag.negatives.length} negativas, 1 RSA`
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
