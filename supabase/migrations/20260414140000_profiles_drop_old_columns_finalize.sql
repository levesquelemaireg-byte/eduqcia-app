-- ============================================================
-- FINALISATION : suppression des anciennes colonnes
-- PRÉREQUIS : tout le code applicatif utilise first_name/last_name/school_id
-- ============================================================

-- 1. Rendre les nouvelles colonnes NOT NULL
ALTER TABLE profiles ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN last_name  SET NOT NULL;

-- 2. Dropper la vue qui dépend des anciennes colonnes
DROP VIEW IF EXISTS banque_tae;

-- 3. Supprimer les anciennes colonnes
ALTER TABLE profiles DROP COLUMN full_name;
ALTER TABLE profiles DROP COLUMN school;

-- 4. Recréer la vue banque_tae avec les nouvelles colonnes
CREATE OR REPLACE VIEW banque_tae
WITH (security_invoker = true)
AS
SELECT
  t.id,
  t.auteur_id,
  p.first_name                      AS auteur_prenom,
  p.last_name                       AS auteur_nom,
  s.nom_officiel                    AS auteur_ecole,
  c_css.nom_officiel                AS auteur_css,
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
  co.enonce                         AS comportement_enonce,
  co.nb_documents,
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
LEFT JOIN schools s       ON s.id  = p.school_id
LEFT JOIN css c_css       ON c_css.id = s.css_id
LEFT JOIN oi              ON oi.id = t.oi_id
LEFT JOIN comportements co ON co.id = t.comportement_id
LEFT JOIN niveaux n       ON n.id  = t.niveau_id
LEFT JOIN disciplines d   ON d.id  = t.discipline_id
LEFT JOIN vote_counts vc  ON vc.tae_id = t.id AND vc.tae_version = t.version
WHERE t.is_published = TRUE
  AND t.is_archived  = FALSE;

-- 5. Mettre à jour la politique RLS profiles_update_own
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role   = (SELECT role   FROM profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM profiles WHERE id = auth.uid())
  );
