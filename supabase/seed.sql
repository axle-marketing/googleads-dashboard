-- Seed niches and the Commercial Cleaning strategy.
-- Safe to run multiple times (ON CONFLICT DO NOTHING / upsert by name).

-- Niches -------------------------------------------------------------------
INSERT INTO niches (name, description)
VALUES
  ('Cleaning', 'Empresas de limpeza comercial e residencial'),
  ('Construction', 'Construção civil e serviços relacionados')
ON CONFLICT (name) DO NOTHING;

-- Commercial strategy under the Cleaning niche ------------------------------
-- config.builder = 'commercial_cleaning' tells the dashboard to run the
-- code-driven Google Ads builder when this strategy is selected.
INSERT INTO strategies (niche_id, name, description, config)
SELECT
  n.id,
  'Commercial',
  'Campanha de pesquisa hiper-segmentada (Office, Medical & Dental, Post-Construction, School) com listas negativas a nível de campanha e RSAs prontos.',
  '{
    "builder": "commercial_cleaning",
    "ad_groups": [
      { "key": "office", "name": "Office Cleaning" },
      { "key": "medical", "name": "Medical & Dental" },
      { "key": "post_construction", "name": "Post-Construction" },
      { "key": "school", "name": "School Cleaning" }
    ]
  }'::jsonb
FROM niches n
WHERE n.name = 'Cleaning'
ON CONFLICT (niche_id, name) DO UPDATE
  SET config = EXCLUDED.config,
      description = EXCLUDED.description;
