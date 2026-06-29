-- Create niches table
CREATE TABLE IF NOT EXISTS niches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_id UUID NOT NULL REFERENCES niches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(niche_id, name)
);

-- Create campaign drafts table
CREATE TABLE IF NOT EXISTS campaign_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(255) NOT NULL,
  niche_id UUID NOT NULL REFERENCES niches(id),
  strategy_id UUID NOT NULL REFERENCES strategies(id),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  google_ads_draft_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategies_niche_id ON strategies(niche_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_customer_id ON campaign_drafts(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_niche_id ON campaign_drafts(niche_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_strategy_id ON campaign_drafts(strategy_id);
CREATE INDEX IF NOT EXISTS idx_campaign_drafts_status ON campaign_drafts(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_niches_updated_at BEFORE UPDATE ON niches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_drafts_updated_at BEFORE UPDATE ON campaign_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Enable read access for all users" ON niches
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON strategies
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON campaign_drafts
  FOR SELECT USING (true);
