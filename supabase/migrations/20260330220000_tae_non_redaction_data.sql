-- Parcours 1.3 (avant / après) — JSON structuré nullable ; 1.1/1.2 restent NULL.
ALTER TABLE tae
  ADD COLUMN IF NOT EXISTS non_redaction_data JSONB;

COMMENT ON COLUMN tae.non_redaction_data IS
  'Données non rédactionnelles structurées (ex. type avant-apres). NULL pour les parcours sans JSON ou legacy.';
