-- Repère temporel, année normalisée, visibilité banque (is_published) pour documents issus d'une TAÉ

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS repere_temporel TEXT;

COMMENT ON COLUMN documents.repere_temporel IS
  'Repère temporel (texte libre). Saisie par l''enseignant ; non affiché sur la fiche élève.';

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS annee_normalisee INTEGER;

COMMENT ON COLUMN documents.annee_normalisee IS
  'Année normalisée (entier, peut être négatif). Comparaisons parcours non rédactionnels OI1.';

-- is_published existant : sémantique « visible banque » — pas de colonne is_public
