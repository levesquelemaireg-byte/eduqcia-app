-- Phase 3 Section B — Schéma de caractérisation (parcours CD1).
-- Ajoute :
--   - tache.type_tache         : section_a | section_b | section_c (valeur par défaut : section_a)
--   - tache.schema_cd1_data    : JSONB préambule + chapeau + 7 cases (guidage + réponse)
--   - tache_documents.est_leurre         : document hors cadre des aspects ciblés
--   - tache_documents.cases_associees    : tableau des clés de cases alimentées

ALTER TABLE tache
  ADD COLUMN IF NOT EXISTS type_tache TEXT NOT NULL DEFAULT 'section_a'
    CHECK (type_tache IN ('section_a', 'section_b', 'section_c'));

ALTER TABLE tache
  ADD COLUMN IF NOT EXISTS schema_cd1_data JSONB DEFAULT NULL;

ALTER TABLE tache_documents
  ADD COLUMN IF NOT EXISTS est_leurre BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tache_documents
  ADD COLUMN IF NOT EXISTS cases_associees TEXT[] NOT NULL DEFAULT '{}';
