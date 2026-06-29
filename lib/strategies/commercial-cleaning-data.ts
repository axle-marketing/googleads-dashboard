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
  headlines: string[]; // headline #1 is generated dynamically (company/location)
  descriptions: string[];
  keywords: KeywordEntry[];
  negatives: KeywordEntry[]; // ad-group-level cross negatives
}

export const BACKUP_HEADLINE = 'Expert Local Cleaning Team';

export const AD_GROUPS: AdGroupTemplate[] = [
  {
    key: 'office',
    name: 'AG - Office Cleaning',
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
      { text: 'office cleaning services', matchType: 'EXACT' },
      { text: 'office cleaning services', matchType: 'PHRASE' },
      { text: 'corporate office cleaners', matchType: 'EXACT' },
      { text: 'commercial office cleaning', matchType: 'PHRASE' },
      { text: 'janitorial services for offices', matchType: 'EXACT' },
      { text: 'office janitorial companies', matchType: 'PHRASE' },
      { text: 'business cleaning services', matchType: 'EXACT' },
      { text: 'professional office cleaners', matchType: 'PHRASE' },
    ],
    negatives: [
      { text: 'medical', matchType: 'BROAD' },
      { text: 'dental', matchType: 'BROAD' },
      { text: 'construction', matchType: 'BROAD' },
      { text: 'school', matchType: 'BROAD' },
    ],
  },
  {
    key: 'medical',
    name: 'AG - Medical & Dental',
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
      { text: 'medical office cleaning', matchType: 'EXACT' },
      { text: 'medical cleaning services', matchType: 'PHRASE' },
      { text: 'dental office cleaning companies', matchType: 'EXACT' },
      { text: 'healthcare facility cleaning', matchType: 'PHRASE' },
      { text: 'medical janitorial services', matchType: 'EXACT' },
      { text: 'terminal cleaning services', matchType: 'PHRASE' },
      { text: 'hospital cleaning contractors', matchType: 'EXACT' },
      { text: 'OSHA compliant cleaning', matchType: 'PHRASE' },
    ],
    negatives: [
      { text: 'medical supplies', matchType: 'PHRASE' },
      { text: 'dental equipment', matchType: 'PHRASE' },
    ],
  },
  {
    key: 'post_construction',
    name: 'AG - Post-Construction',
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
      { text: 'post construction cleaning', matchType: 'EXACT' },
      { text: 'post construction cleaning services', matchType: 'PHRASE' },
      { text: 'after builders cleaning', matchType: 'EXACT' },
      { text: 'after builders cleaners', matchType: 'PHRASE' },
      { text: 'commercial construction cleanup', matchType: 'EXACT' },
      { text: 'site cleanup contractors', matchType: 'PHRASE' },
      { text: 'rough and final cleaning', matchType: 'EXACT' },
      { text: 'new build cleaning services', matchType: 'PHRASE' },
    ],
    negatives: [
      { text: 'residential', matchType: 'BROAD' },
      { text: 'home renovation', matchType: 'PHRASE' },
    ],
  },
  {
    key: 'school',
    name: 'AG - School Cleaning',
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
      { text: 'school cleaning services', matchType: 'EXACT' },
      { text: 'school janitorial services', matchType: 'PHRASE' },
      { text: 'educational facility cleaning', matchType: 'EXACT' },
      { text: 'university cleaning companies', matchType: 'PHRASE' },
      { text: 'daycare cleaning services', matchType: 'EXACT' },
      { text: 'school sanitation services', matchType: 'PHRASE' },
      { text: 'gymnasium cleaning', matchType: 'EXACT' },
      { text: 'school contract cleaning', matchType: 'PHRASE' },
    ],
    negatives: [
      { text: 'school supplies', matchType: 'PHRASE' },
      { text: 'students', matchType: 'BROAD' },
    ],
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
