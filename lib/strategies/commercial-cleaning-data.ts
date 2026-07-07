// Commercial Cleaning strategy template.
// Headlines (<=30 chars) and descriptions (<=90 chars) use {company_name} and
// {location} placeholders, replaced at build time with character-limit fallback.

export type MatchType = 'EXACT' | 'PHRASE' | 'BROAD';

export interface KeywordEntry {
  text: string;
  matchType: MatchType;
}

export interface AdGroupTemplate {
  key: string;
  name: string;
  // Keyword-driven headlines that mirror popular search terms (may include
  // {location}). Placed right after the dynamic headline so they're prioritized
  // for search-term correspondence.
  keywordHeadlines: string[];
  headlines: string[]; // benefit/CTA headlines
  descriptions: string[];
  keywords: KeywordEntry[];
  negatives: KeywordEntry[]; // ad-group-level cross negatives
  // Broad keywords using the {abbr} placeholder (state abbreviation), added
  // only when no city is selected. E.g. "office cleaning {abbr}" -> "...MA".
  abbrevKeywords: string[];
  slug: string; // URL segment / anchor for this service (e.g. "office")
  sitelinkText: string; // ad-group-specific sitelink label
  calloutText?: string; // optional ad-group-specific callout
}

// Campaign-level sitelinks (5 fixed). Each `slug` becomes "/#slug" (one-page
// site) or "/slug" (client has separate pages per service).
export const CAMPAIGN_SITELINKS: { text: string; slug: string }[] = [
  { text: 'About Us', slug: 'about-us' },
  { text: 'Get a Quote', slug: 'quote' },
  { text: 'Our Services', slug: 'services' },
  { text: 'Contact Us', slug: 'contact' },
  { text: 'Service Area', slug: 'service-area' },
];

// Campaign-level callouts (general trust signals, <=25 chars each).
export const CAMPAIGN_CALLOUTS: string[] = [
  'Fully Insured & Bonded',
  'Free Custom Estimates',
  'Background-Checked Staff',
];

export const BACKUP_HEADLINE = 'Expert Local Cleaning Team';

export const AD_GROUPS: AdGroupTemplate[] = [
  {
    key: 'office',
    name: 'AG - Office Cleaning',
    keywordHeadlines: [
      'Office Cleaning {location}',
      'Office Cleaning Services',
      'Commercial Office Cleaning',
      'Janitorial Services',
    ],
    headlines: [
      'Top-Rated Office Cleaners',
      'Commercial Office Cleaners',
      'Daily & Weekly Office Clean',
      'Professional Janitorial Team',
      'Trusted Office Cleaners',
      'Local Office Cleaning Pros',
      'Get Your Free Office Quote',
      'Customized Office Cleaning',
      'Sparkling Workspace Today',
      'Insured Office Janitorial',
      'Clean Offices, Happy Teams',
      'Reliable Office Cleaning',
      'Expert Desk & Floor Cleaning',
      'After-Hours Office Cleaners',
    ],
    descriptions: [
      'Keep your workspace spotless with {company_name}. Custom scheduling for your business.',
      'Top-rated office cleaning in {location}. Fully insured, bonded, and background-checked.',
      'Professional janitorial and commercial cleaning for offices. Request a free quote today!',
      'Trusted office cleaners in {location}. Daily, weekly, or custom plans for your workspace.',
    ],
    keywords: [
      // Exact
      { text: 'office cleaning services', matchType: 'EXACT' },
      { text: 'office cleaning services near me', matchType: 'EXACT' },
      { text: 'office cleaning services {location}', matchType: 'EXACT' },
      { text: 'corporate office cleaners', matchType: 'EXACT' },
      { text: 'corporate office cleaners near me', matchType: 'EXACT' },
      { text: 'corporate office cleaning {location}', matchType: 'EXACT' },
      { text: 'janitorial services for offices', matchType: 'EXACT' },
      { text: 'janitorial services near me', matchType: 'EXACT' },
      { text: 'janitorial services {location}', matchType: 'EXACT' },
      { text: 'business cleaning services', matchType: 'EXACT' },
      { text: 'business cleaning services near me', matchType: 'EXACT' },
      { text: 'commercial office cleaning', matchType: 'EXACT' },
      { text: 'commercial office cleaning {location}', matchType: 'EXACT' },
      // Phrase
      { text: 'office cleaning services', matchType: 'PHRASE' },
      { text: 'office cleaning near me', matchType: 'PHRASE' },
      { text: 'office cleaning {location}', matchType: 'PHRASE' },
      { text: 'commercial office cleaning', matchType: 'PHRASE' },
      { text: 'commercial office cleaning near me', matchType: 'PHRASE' },
      { text: 'commercial office cleaning {location}', matchType: 'PHRASE' },
      { text: 'office janitorial companies', matchType: 'PHRASE' },
      { text: 'office janitorial companies near me', matchType: 'PHRASE' },
      { text: 'professional office cleaners', matchType: 'PHRASE' },
      { text: 'professional office cleaners near me', matchType: 'PHRASE' },
      { text: 'professional office cleaners {location}', matchType: 'PHRASE' },
      { text: 'janitorial contracts', matchType: 'PHRASE' },
      { text: 'janitorial contracts {location}', matchType: 'PHRASE' },
      { text: 'facility maintenance near me', matchType: 'PHRASE' },
      // Broad
      { text: 'office cleaning', matchType: 'BROAD' },
      { text: 'office cleaning near me', matchType: 'BROAD' },
      { text: 'commercial cleaners {location}', matchType: 'BROAD' },
      { text: 'office cleaning {location}', matchType: 'BROAD' },
    ],
    negatives: [
      { text: 'medical', matchType: 'BROAD' },
      { text: 'dental', matchType: 'BROAD' },
      { text: 'construction', matchType: 'BROAD' },
      { text: 'school', matchType: 'BROAD' },
    ],
    abbrevKeywords: [
      'office cleaning {abbr}',
      'commercial cleaning {abbr}',
    ],
    slug: 'office',
    sitelinkText: 'Office Cleaning',
  },
  {
    key: 'medical',
    name: 'AG - Medical & Dental',
    keywordHeadlines: [
      'Medical Cleaning {location}',
      'Medical Office Cleaning',
      'Medical Cleaning Services',
      'Healthcare Facility Cleaning',
    ],
    headlines: [
      'Medical Office Cleaning',
      'Dental Clinic Cleaning',
      'OSHA Compliant Cleaners',
      'Healthcare Facility Clean',
      'Sanitized Clinic Cleaners',
      'Infection Control Cleaning',
      'Medical Janitorial Services',
      'Terminal Cleaning Services',
      'Hospital-Grade Sanitation',
      'Insured Medical Cleaners',
      'Top-Rated Clinic Cleaning',
      'HIPAA Compliant Cleaners',
      'Request Clinic Walkthrough',
      'Safe Healthcare Cleaning',
    ],
    descriptions: [
      'HIPAA & OSHA compliant medical office cleaning in {location}. Specialized sanitation plans.',
      'Infection control & terminal cleaning for dental & medical clinics. Fully insured team.',
      'Hospital-grade cleaning services with strict compliance standards. Get your free quote!',
      'Keep patients safe with professional medical cleaning by {company_name}. Book a walkthrough.',
    ],
    keywords: [
      // Exact
      { text: 'medical office cleaning', matchType: 'EXACT' },
      { text: 'medical office cleaning near me', matchType: 'EXACT' },
      { text: 'medical office cleaning {location}', matchType: 'EXACT' },
      { text: 'dental office cleaning companies', matchType: 'EXACT' },
      { text: 'dental office cleaning near me', matchType: 'EXACT' },
      { text: 'dental clinic cleaners {location}', matchType: 'EXACT' },
      { text: 'medical janitorial services', matchType: 'EXACT' },
      { text: 'medical janitorial services near me', matchType: 'EXACT' },
      { text: 'medical janitorial services {location}', matchType: 'EXACT' },
      { text: 'hospital cleaning contractors', matchType: 'EXACT' },
      { text: 'hospital cleaning contractors near me', matchType: 'EXACT' },
      { text: 'healthcare cleaning services', matchType: 'EXACT' },
      { text: 'healthcare cleaning services near me', matchType: 'EXACT' },
      { text: 'healthcare cleaning services {location}', matchType: 'EXACT' },
      // Phrase
      { text: 'medical cleaning services', matchType: 'PHRASE' },
      { text: 'medical cleaning services near me', matchType: 'PHRASE' },
      { text: 'medical cleaning services {location}', matchType: 'PHRASE' },
      { text: 'healthcare facility cleaning', matchType: 'PHRASE' },
      { text: 'healthcare facility cleaning near me', matchType: 'PHRASE' },
      { text: 'terminal cleaning services', matchType: 'PHRASE' },
      { text: 'terminal cleaning services near me', matchType: 'PHRASE' },
      { text: 'terminal cleaning services {location}', matchType: 'PHRASE' },
      { text: 'OSHA compliant cleaning', matchType: 'PHRASE' },
      { text: 'OSHA compliant cleaning near me', matchType: 'PHRASE' },
      { text: 'HIPAA compliant medical cleaning', matchType: 'PHRASE' },
      { text: 'hospital janitorial company {location}', matchType: 'PHRASE' },
      // Broad
      { text: 'medical cleaning', matchType: 'BROAD' },
      { text: 'medical cleaning near me', matchType: 'BROAD' },
      { text: 'dental clinic cleaners {location}', matchType: 'BROAD' },
      { text: 'medical office cleaners near me', matchType: 'BROAD' },
    ],
    negatives: [
      { text: 'medical supplies', matchType: 'PHRASE' },
      { text: 'dental equipment', matchType: 'PHRASE' },
    ],
    abbrevKeywords: [
      'medical cleaning {abbr}',
      'medical office cleaning {abbr}',
    ],
    slug: 'medical',
    sitelinkText: 'Medical Cleaning',
    calloutText: 'OSHA & HIPAA Compliant',
  },
  {
    key: 'post_construction',
    name: 'AG - Post-Construction',
    keywordHeadlines: [
      'Post Construction Cleaning',
      'Construction Cleanup {location}',
      'After Builders Cleaning',
      'Commercial Construction Clean',
    ],
    headlines: [
      'Post-Construction Cleanup',
      'After Builders Cleaning',
      'Final Dust Cleaning',
      'Commercial Post-Build Clean',
      'Rough & Final Cleaning',
      'Construction Clean Services',
      'Contractors Cleaning Service',
      'Move-In Ready Commercial',
      'Site Cleanup Professionals',
      'Prompt Post-Renovation Clean',
      'Debris & Dust Removal',
      'Get Post-Construction Quote',
      'Commercial Remodel Cleanup',
      'Insured Construction Clean',
    ],
    descriptions: [
      'Expert post-construction cleaning in {location}. Rough, final, and touch-up cleans.',
      'From debris to final dust detail. Reliable post-build cleaning for commercial sites.',
      'Ensure your new commercial property is move-in ready. Fully insured & safety certified.',
      'Prompt and professional post-renovation cleanup. Contact us today for a walkthrough!',
    ],
    keywords: [
      // Exact
      { text: 'post construction cleaning', matchType: 'EXACT' },
      { text: 'post construction cleaning near me', matchType: 'EXACT' },
      { text: 'post construction cleaning {location}', matchType: 'EXACT' },
      { text: 'after builders cleaning', matchType: 'EXACT' },
      { text: 'after builders cleaning near me', matchType: 'EXACT' },
      { text: 'commercial construction cleanup', matchType: 'EXACT' },
      { text: 'commercial construction cleanup near me', matchType: 'EXACT' },
      { text: 'commercial construction cleanup {location}', matchType: 'EXACT' },
      { text: 'rough and final cleaning', matchType: 'EXACT' },
      { text: 'rough and final cleaning {location}', matchType: 'EXACT' },
      { text: 'post renovation cleaning', matchType: 'EXACT' },
      { text: 'post renovation cleaning near me', matchType: 'EXACT' },
      { text: 'post renovation cleaning {location}', matchType: 'EXACT' },
      // Phrase
      { text: 'post construction cleaning services', matchType: 'PHRASE' },
      { text: 'post construction cleaning near me', matchType: 'PHRASE' },
      { text: 'post construction cleaning {location}', matchType: 'PHRASE' },
      { text: 'site cleanup contractors', matchType: 'PHRASE' },
      { text: 'site cleanup contractors near me', matchType: 'PHRASE' },
      { text: 'site cleanup contractors {location}', matchType: 'PHRASE' },
      { text: 'new build cleaning services', matchType: 'PHRASE' },
      { text: 'new build cleaning services near me', matchType: 'PHRASE' },
      { text: 'new build cleaning {location}', matchType: 'PHRASE' },
      { text: 'after renovation cleaning services', matchType: 'PHRASE' },
      { text: 'after renovation cleaning services near me', matchType: 'PHRASE' },
      { text: 'builders clean {location}', matchType: 'PHRASE' },
      // Broad
      { text: 'post construction cleaning', matchType: 'BROAD' },
      { text: 'post construction cleaning near me', matchType: 'BROAD' },
      { text: 'construction cleanup {location}', matchType: 'BROAD' },
      { text: 'post renovation cleaning near me', matchType: 'BROAD' },
    ],
    negatives: [
      { text: 'residential', matchType: 'BROAD' },
      { text: 'home renovation', matchType: 'PHRASE' },
    ],
    abbrevKeywords: [
      'post construction cleaning {abbr}',
      'construction cleanup {abbr}',
    ],
    slug: 'post-construction',
    sitelinkText: 'Post-Construction',
  },
  {
    key: 'school',
    name: 'AG - School Cleaning',
    keywordHeadlines: [
      'School Cleaning {location}',
      'School Cleaning Services',
      'School Janitorial Services',
      'Educational Facility Clean',
    ],
    headlines: [
      'School Cleaning Services',
      'Educational Facility Clean',
      'Daycare Janitorial Services',
      'University Cleaning Team',
      'Safe School Sanitization',
      'Daily School Janitorial',
      'Campus Cleaning Contractors',
      'Insured School Cleaners',
      'Eco-Friendly Janitorial',
      'Classroom & Gym Cleaning',
      'Reliable School Janitorial',
      'Get Free Janitorial Quote',
      'Trusted School Contractors',
      'Custom Educational Cleaning',
    ],
    descriptions: [
      'Pristine janitorial services for schools, daycares & universities in {location}.',
      'Safe, non-toxic, and deep cleaning for educational institutions. Background-checked team.',
      'Keep classrooms, gyms & restrooms sanitary. Customized school janitorial contracts.',
      'Trusted school cleaning contractors. Insured staff and flexible after-hours scheduling.',
    ],
    keywords: [
      // Exact
      { text: 'school cleaning services', matchType: 'EXACT' },
      { text: 'school cleaning services near me', matchType: 'EXACT' },
      { text: 'school cleaning services {location}', matchType: 'EXACT' },
      { text: 'educational facility cleaning', matchType: 'EXACT' },
      { text: 'educational facility cleaning near me', matchType: 'EXACT' },
      { text: 'educational facility cleaning {location}', matchType: 'EXACT' },
      { text: 'daycare cleaning services', matchType: 'EXACT' },
      { text: 'daycare cleaning services near me', matchType: 'EXACT' },
      { text: 'daycare cleaning services {location}', matchType: 'EXACT' },
      { text: 'gymnasium cleaning', matchType: 'EXACT' },
      { text: 'gymnasium cleaning {location}', matchType: 'EXACT' },
      { text: 'university cleaning services', matchType: 'EXACT' },
      { text: 'university cleaning services near me', matchType: 'EXACT' },
      // Phrase
      { text: 'school janitorial services', matchType: 'PHRASE' },
      { text: 'school janitorial services near me', matchType: 'PHRASE' },
      { text: 'school janitorial services {location}', matchType: 'PHRASE' },
      { text: 'university cleaning companies', matchType: 'PHRASE' },
      { text: 'university cleaning companies near me', matchType: 'PHRASE' },
      { text: 'school sanitation services', matchType: 'PHRASE' },
      { text: 'school sanitation services near me', matchType: 'PHRASE' },
      { text: 'school sanitation services {location}', matchType: 'PHRASE' },
      { text: 'school contract cleaning', matchType: 'PHRASE' },
      { text: 'school contract cleaning {location}', matchType: 'PHRASE' },
      { text: 'childcare facility sanitation near me', matchType: 'PHRASE' },
      // Broad
      { text: 'school cleaning', matchType: 'BROAD' },
      { text: 'school cleaning near me', matchType: 'BROAD' },
      { text: 'daycare cleaners {location}', matchType: 'BROAD' },
      { text: 'school cleaning services near me', matchType: 'BROAD' },
    ],
    negatives: [
      { text: 'school supplies', matchType: 'PHRASE' },
      { text: 'students', matchType: 'BROAD' },
    ],
    abbrevKeywords: [
      'school cleaning {abbr}',
      'school janitorial {abbr}',
    ],
    slug: 'school',
    sitelinkText: 'School Cleaning',
    calloutText: 'Eco-Friendly Products',
  },
];

// Campaign-level shared negative keyword lists (one per uploaded spreadsheet).
// All BROAD. See `commercial-cleaning-negatives.ts` for the actual word lists.
export interface NegativeList {
  name: string;
  keywords: string[];
}

// Structured snippet (campaign-level asset). "Service catalog" from the doc is
// not a valid Google header; "Services" is the correct enum value.
export const STRUCTURED_SNIPPET = {
  header: 'Services',
  values: [
    'Office Cleaning',
    'Medical Facilities',
    'Post-Construction',
    'School Janitorial',
    'Floor Care',
  ],
};

export const MAX_HEADLINE = 30;
export const MAX_DESCRIPTION = 90;

/**
 * Builds headline #1 from company/location, choosing the longest variant that
 * still fits within 30 characters, falling back to a generic backup.
 */
export function buildPrimaryHeadline(
  companyName: string,
  city: string,
  locationString: string
): string {
  const candidates = [
    `${companyName} | ${locationString}`,
    `${companyName} | ${city}`,
    companyName,
    BACKUP_HEADLINE,
  ];
  for (const c of candidates) {
    if (c.length <= MAX_HEADLINE) return c;
  }
  return BACKUP_HEADLINE.slice(0, MAX_HEADLINE);
}

/** Replaces placeholders and enforces a max length with a clean fallback. */
export function renderText(
  template: string,
  companyName: string,
  city: string,
  locationString: string,
  maxLen: number
): string {
  const full = template
    .replaceAll('{company_name}', companyName)
    .replaceAll('{location}', locationString);
  if (full.length <= maxLen) return full;

  // Try again using the shorter city instead of the region-extended location
  const withCity = template
    .replaceAll('{company_name}', companyName)
    .replaceAll('{location}', city);
  if (withCity.length <= maxLen) return withCity;

  // Last resort: hard truncate at a word boundary
  return withCity.slice(0, maxLen).replace(/\s+\S*$/, '').trim();
}
