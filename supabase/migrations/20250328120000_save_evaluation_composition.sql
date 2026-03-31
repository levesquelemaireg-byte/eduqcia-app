-- RPC : sauvegarde composition d'évaluation (brouillon ou publication)
-- Aligné sur le plan module création évaluation — éligibilité TAÉ : publiée OU auteur OU collaborateur.

CREATE OR REPLACE FUNCTION save_evaluation_composition(
  p_evaluation_id uuid,
  p_titre text,
  p_tae_ids uuid[],
  p_publish boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_eval_id uuid;
  v_tae uuid;
  v_ordre int;
  v_len int;
BEGIN
  IF NOT auth_is_active() THEN
    RAISE EXCEPTION 'save_evaluation_composition: compte inactif';
  END IF;

  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'save_evaluation_composition: non authentifié';
  END IF;

  p_titre := NULLIF(trim(COALESCE(p_titre, '')), '');
  IF p_titre IS NULL THEN
    RAISE EXCEPTION 'save_evaluation_composition: titre requis';
  END IF;

  v_len := COALESCE(array_length(p_tae_ids, 1), 0);

  IF p_publish AND v_len < 1 THEN
    RAISE EXCEPTION 'save_evaluation_composition: publication sans tâche';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_tae_ids) u GROUP BY u HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'save_evaluation_composition: tâche dupliquée dans la composition';
  END IF;

  PERFORM set_config('row_security', 'off', true);

  IF p_evaluation_id IS NULL THEN
    INSERT INTO evaluations (auteur_id, titre, is_published, is_archived)
    VALUES (v_uid, p_titre, FALSE, FALSE)
    RETURNING id INTO v_eval_id;
  ELSE
    v_eval_id := p_evaluation_id;
    IF NOT EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = v_eval_id AND e.auteur_id = v_uid AND e.is_archived = FALSE
    ) THEN
      RAISE EXCEPTION 'save_evaluation_composition: évaluation introuvable';
    END IF;
  END IF;

  FOREACH v_tae IN ARRAY p_tae_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM tae t
      WHERE t.id = v_tae
        AND t.is_archived = FALSE
        AND (
          t.is_published = TRUE
          OR t.auteur_id = v_uid
          OR EXISTS (
            SELECT 1 FROM tae_collaborateurs tc
            WHERE tc.tae_id = t.id AND tc.user_id = v_uid
          )
        )
    ) THEN
      RAISE EXCEPTION 'save_evaluation_composition: tâche non éligible';
    END IF;
  END LOOP;

  DELETE FROM evaluation_tae WHERE evaluation_id = v_eval_id;

  v_ordre := 0;
  FOREACH v_tae IN ARRAY p_tae_ids LOOP
    INSERT INTO evaluation_tae (evaluation_id, tae_id, ordre)
    VALUES (v_eval_id, v_tae, v_ordre);
    v_ordre := v_ordre + 1;
  END LOOP;

  UPDATE evaluations
  SET
    titre = p_titre,
    is_published = CASE WHEN p_publish THEN TRUE ELSE is_published END,
    updated_at = NOW()
  WHERE id = v_eval_id;

  RETURN v_eval_id;
END;
$$;

GRANT EXECUTE ON FUNCTION save_evaluation_composition(uuid, text, uuid[], boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION save_evaluation_composition(uuid, text, uuid[], boolean) TO service_role;
