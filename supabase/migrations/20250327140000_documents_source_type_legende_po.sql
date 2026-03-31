-- PO documents (27 mars 2026) — source primaire/secondaire, légende iconographique.
-- Aligné docs/BACKLOG.md § Migration SQL PO documents.
-- Idempotent : les types peuvent déjà exister (base alignée sur schema.sql ou migration rejouée).

DO $$
BEGIN
  CREATE TYPE document_source_type AS ENUM (
    'primaire',
    'secondaire'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE document_legend_position AS ENUM (
    'haut_gauche',
    'haut_droite',
    'bas_gauche',
    'bas_droite'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS source_type document_source_type NOT NULL DEFAULT 'secondaire',
  ADD COLUMN IF NOT EXISTS image_legende TEXT,
  ADD COLUMN IF NOT EXISTS image_legende_position document_legend_position;

COMMENT ON COLUMN documents.source_type IS
  'Source primaire ou secondaire — choix obligatoire en UI pour les nouveaux formulaires ; défaut secondaire pour données existantes et inserts RPC tant que le payload n''envoie pas la valeur.';
COMMENT ON COLUMN documents.image_legende IS
  'Légende optionnelle (document iconographique) ; max 50 mots — validation application.';
COMMENT ON COLUMN documents.image_legende_position IS
  'Coin du bandeau de légende sur l''image ; NULL si pas de légende.';

CREATE INDEX IF NOT EXISTS idx_doc_source_type ON documents (source_type);
