-- Catégorie didactique optionnelle pour les documents iconographiques (banque, filtres).

ALTER TABLE documents
  ADD COLUMN type_iconographique TEXT NULL;

COMMENT ON COLUMN documents.type_iconographique IS
  'Sous-type didactique pour documents iconographiques (carte, photographie, etc.) ; facilite la recherche en banque ; non affiché sur la copie de l'élève.';

CREATE INDEX idx_doc_type_iconographique ON documents (type_iconographique)
  WHERE type = 'iconographique'::doc_type AND type_iconographique IS NOT NULL;
