// Nicho
export type Niche = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

// Estratégia - defines campaign structure templates
export type Strategy = {
  id: string;
  niche_id: string;
  name: string;
  description: string;
  config: StrategyConfig;
  created_at: string;
  updated_at: string;
};

export type StrategyConfig = {
  campaigns: CampaignTemplate[];
};

// Campaign template
export type CampaignTemplate = {
  name: string;
  type: string;
  budget_daily: number;
  bidding_strategy: string;
  ad_groups: AdGroupTemplate[];
};

// Ad Group template
export type AdGroupTemplate = {
  name: string;
  keywords: KeywordTemplate[];
  ads: AdTemplate[];
};

// Keyword template
export type KeywordTemplate = {
  text: string;
  match_type: 'EXACT' | 'PHRASE' | 'BROAD';
  is_negative?: boolean;
};

// Ad template
export type AdTemplate = {
  headlines: string[];
  descriptions: string[];
  display_paths: string[];
  structured_snippets?: Record<string, string[]>;
};

// Google Ads - Client
export type GoogleAdsAccount = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  created_at: string;
};

// Google Ads - Campaign Draft
export type CampaignDraft = {
  id: string;
  customer_id: string;
  niche_id: string;
  strategy_id: string;
  name: string;
  status: 'draft' | 'promoted' | 'discarded';
  created_at: string;
  updated_at: string;
};
