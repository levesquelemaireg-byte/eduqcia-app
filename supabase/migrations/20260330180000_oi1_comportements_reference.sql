-- OI1 (Situer dans le temps) : enregistrements comportements 1.1–1.3 pour la FK
-- `tae.comportement_id` + alignement `nb_documents` avec `public/data/oi.json`
-- (4 documents ordre chrono ; NULL pour avant/après tant que non figé côté produit).

ALTER TABLE comportements DROP CONSTRAINT IF EXISTS comportements_nb_documents_check;

ALTER TABLE comportements
  ALTER COLUMN nb_documents DROP NOT NULL;

ALTER TABLE comportements ADD CONSTRAINT comportements_nb_documents_check
  CHECK (nb_documents IS NULL OR nb_documents BETWEEN 1 AND 4);

UPDATE oi SET status = 'active' WHERE id = 'OI1';

INSERT INTO comportements (id, oi_id, enonce, nb_documents, outil_evaluation, status, ordre) VALUES
  ('1.1', 'OI1', 'Ordonner chronologiquement des faits en tenant compte de repères de temps', 4, 'OI1_SO1', 'active', 0),
  ('1.2', 'OI1', 'Situer des faits sur une ligne du temps', 1, 'OI1_SO2', 'active', 1),
  ('1.3', 'OI1', 'Classer des faits selon qu''ils sont antérieurs ou postérieurs à un repère de temps', NULL, 'OI1_SO3', 'active', 2)
ON CONFLICT (id) DO UPDATE SET
  oi_id = EXCLUDED.oi_id,
  enonce = EXCLUDED.enonce,
  nb_documents = EXCLUDED.nb_documents,
  outil_evaluation = EXCLUDED.outil_evaluation,
  status = EXCLUDED.status,
  ordre = EXCLUDED.ordre;
