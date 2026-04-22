-- ============================================================================
-- Migration : rename view banque_tae → banque_tache
-- ============================================================================
-- Rattrapage du lot 3 : la vue `banque_tae` n'avait pas été renommée car
-- le pattern `\btae\b` ne l'attrapait pas (tae précédé de `_`). On drop +
-- recrée avec le nouveau nom.
-- ============================================================================

DROP VIEW IF EXISTS banque_tae;

CREATE VIEW banque_tache
WITH (security_invoker = true)
AS
SELECT
  t.id,
  t.auteur_id,
  p.first_name || ' ' || p.last_name AS auteur_nom,
  s.nom_officiel                     AS auteur_ecole,
  cs.nom_officiel                    AS auteur_css,
  left(trim(t.consigne), 80)         AS apercu,
  t.consigne,
  t.consigne_search_plain,
  (
    COALESCE(vc.total_votants, 0)
    + COALESCE(
      (SELECT COUNT(*)::int FROM evaluation_tache et WHERE et.tae_id = t.id),
      0
    )
  )::int                             AS bank_popularity_score,
  t.oi_id,
  oi.titre                           AS oi_titre,
  oi.status                          AS oi_status,
  t.comportement_id,
  c.enonce                           AS comportement_enonce,
  c.nb_documents,
  t.niveau_id,
  n.label                            AS niveau_label,
  n.cycle,
  t.discipline_id,
  d.label                            AS discipline_label,
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
FROM tache t
JOIN profiles p           ON p.id  = t.auteur_id
LEFT JOIN schools s       ON s.id  = p.school_id
LEFT JOIN css cs          ON cs.id = s.css_id
LEFT JOIN oi              ON oi.id = t.oi_id
LEFT JOIN comportements c ON c.id  = t.comportement_id
LEFT JOIN niveaux n       ON n.id  = t.niveau_id
LEFT JOIN disciplines d   ON d.id  = t.discipline_id
LEFT JOIN vote_counts vc  ON vc.tae_id = t.id AND vc.tae_version = t.version
WHERE t.is_published = TRUE
  AND t.is_archived  = FALSE;
