-- Ajouter la colonne générée consigne_search_plain sur tae (recherche banque)
-- et recréer la vue banque_tae avec consigne, consigne_search_plain, bank_popularity_score.

ALTER TABLE tae ADD COLUMN IF NOT EXISTS consigne_search_plain text GENERATED ALWAYS AS (
  trim(
    both ' ' FROM regexp_replace(
      regexp_replace(consigne, '<[^>]+>', ' ', 'g'),
      '[[:space:]]+',
      ' ',
      'g'
    )
  )
) STORED;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_tae_consigne_search_trgm
  ON tae USING GIN (consigne_search_plain gin_trgm_ops);

DROP VIEW IF EXISTS banque_tae;

CREATE VIEW banque_tae
WITH (security_invoker = true)
AS
SELECT
  t.id,
  t.auteur_id,
  p.full_name                       AS auteur_nom,
  p.school                          AS auteur_ecole,
  left(trim(t.consigne), 80)        AS apercu,
  t.consigne,
  t.consigne_search_plain,
  (
    COALESCE(vc.total_votants, 0)
    + COALESCE(
      (SELECT COUNT(*)::int FROM evaluation_tae et WHERE et.tae_id = t.id),
      0
    )
  )::int                            AS bank_popularity_score,
  t.oi_id,
  oi.titre                          AS oi_titre,
  oi.status                         AS oi_status,
  t.comportement_id,
  c.enonce                          AS comportement_enonce,
  c.nb_documents,
  t.niveau_id,
  n.label                           AS niveau_label,
  n.cycle,
  t.discipline_id,
  d.label                           AS discipline_label,
  t.aspects_societe,
  t.cd_id,
  t.connaissances_ids,
  t.version,
  t.version_updated_at,
  t.created_at,
  t.updated_at,
  vc.total_votants,
  vc.rigueur_n1,    vc.rigueur_n2,    vc.rigueur_n3,
  vc.clarte_n1,     vc.clarte_n2,     vc.clarte_n3,
  vc.alignement_n1, vc.alignement_n2, vc.alignement_n3
FROM tae t
JOIN profiles p           ON p.id  = t.auteur_id
LEFT JOIN oi              ON oi.id = t.oi_id
LEFT JOIN comportements c ON c.id  = t.comportement_id
LEFT JOIN niveaux n       ON n.id  = t.niveau_id
LEFT JOIN disciplines d   ON d.id  = t.discipline_id
LEFT JOIN vote_counts vc  ON vc.tae_id = t.id AND vc.tae_version = t.version
WHERE t.is_published = TRUE
  AND t.is_archived  = FALSE;
