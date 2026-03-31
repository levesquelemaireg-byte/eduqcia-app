-- RPC : mise à jour TAÉ (édition wizard `/questions/[id]/edit`)
-- Même forme de payload que `publish_tae_transaction`.
-- À appliquer sur tout projet Supabase où cette fonction manque (erreur PostgREST PGRST202).
-- Source alignée : `supabase/schema.sql` (bloc update_tae_transaction).

CREATE OR REPLACE FUNCTION update_tae_transaction(p_tae_id uuid, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auteur uuid;
  v_doc_id uuid;
  v_new_ids uuid[] := ARRAY[]::uuid[];
  v_slot jsonb;
  v_doc_ref uuid;
  v_elem jsonb;
  v_aspects aspect_societe[];
  v_cd_id int;
  i int;
  j int;
  v_len int;
  v_nb int;
BEGIN
  v_auteur := (p_payload->>'auteur_id')::uuid;
  IF v_auteur IS NULL OR v_auteur <> auth.uid() THEN
    RAISE EXCEPTION 'update_tae_transaction: auteur_id invalide';
  END IF;

  IF NOT (p_payload ? 'tae' AND p_payload ? 'documents_new' AND p_payload ? 'slots') THEN
    RAISE EXCEPTION 'update_tae_transaction: payload incomplet';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM tae WHERE id = p_tae_id AND auteur_id = v_auteur) THEN
    RAISE EXCEPTION 'update_tae_transaction: tae introuvable ou interdit';
  END IF;

  IF EXISTS (SELECT 1 FROM evaluation_tae WHERE tae_id = p_tae_id) THEN
    RAISE EXCEPTION 'update_tae_transaction: tae utilisée dans une évaluation';
  END IF;

  PERFORM set_config('row_security', 'off', true);

  SELECT COALESCE(
    (SELECT array_agg((value #>> '{}')::aspect_societe)
     FROM jsonb_array_elements(p_payload->'tae'->'aspects_societe') AS t(value)),
    ARRAY[]::aspect_societe[]
  )
  INTO v_aspects;

  v_cd_id := CASE
    WHEN NOT (p_payload->'tae' ? 'cd_id') THEN NULL
    WHEN jsonb_typeof(p_payload->'tae'->'cd_id') = 'null' THEN NULL
    ELSE (p_payload->'tae'->'cd_id')::text::int
  END;

  v_len := COALESCE(jsonb_array_length(p_payload->'documents_new'), 0);
  FOR i IN 0..GREATEST(v_len - 1, -1) LOOP
    v_elem := p_payload->'documents_new'->i;
    INSERT INTO documents (
      auteur_id,
      source_document_id,
      titre,
      type,
      contenu,
      image_url,
      source_citation,
      niveaux_ids,
      disciplines_ids,
      aspects_societe,
      connaissances_ids,
      is_published,
      updated_at
    ) VALUES (
      v_auteur,
      NULL,
      v_elem->>'titre',
      (v_elem->>'type')::doc_type,
      NULLIF(v_elem->>'contenu', ''),
      NULLIF(v_elem->>'image_url', ''),
      v_elem->>'source_citation',
      COALESCE(
        ARRAY(SELECT (jsonb_array_elements(v_elem->'niveaux_ids'))::text::int),
        ARRAY[]::int[]
      ),
      COALESCE(
        ARRAY(SELECT (jsonb_array_elements(v_elem->'disciplines_ids'))::text::int),
        ARRAY[]::int[]
      ),
      COALESCE(
        (SELECT array_agg((value #>> '{}')::aspect_societe)
         FROM jsonb_array_elements(v_elem->'aspects_societe') AS t(value)),
        ARRAY[]::aspect_societe[]
      ),
      COALESCE(
        ARRAY(SELECT (jsonb_array_elements(v_elem->'connaissances_ids'))::text::int),
        ARRAY[]::int[]
      ),
      TRUE,
      NOW()
    )
    RETURNING id INTO v_doc_id;
    v_new_ids := array_append(v_new_ids, v_doc_id);
  END LOOP;

  UPDATE tae SET
    conception_mode = (p_payload->'tae'->>'conception_mode')::conception_mode,
    oi_id = p_payload->'tae'->>'oi_id',
    comportement_id = p_payload->'tae'->>'comportement_id',
    cd_id = v_cd_id,
    connaissances_ids = COALESCE(
      ARRAY(SELECT (jsonb_array_elements(p_payload->'tae'->'connaissances_ids'))::text::int),
      ARRAY[]::int[]
    ),
    consigne = p_payload->'tae'->>'consigne',
    guidage = NULLIF(p_payload->'tae'->>'guidage', ''),
    corrige = NULLIF(p_payload->'tae'->>'corrige', ''),
    nb_lignes = CASE
      WHEN NOT (p_payload->'tae' ? 'nb_lignes') THEN NULL
      WHEN jsonb_typeof(p_payload->'tae'->'nb_lignes') = 'null' THEN NULL
      ELSE (p_payload->'tae'->'nb_lignes')::text::int
    END,
    niveau_id = (p_payload->'tae'->>'niveau_id')::int,
    discipline_id = (p_payload->'tae'->>'discipline_id')::int,
    aspects_societe = v_aspects,
    updated_at = NOW()
  WHERE id = p_tae_id;

  DELETE FROM tae_documents WHERE tae_id = p_tae_id;

  v_nb := jsonb_array_length(p_payload->'slots');
  IF v_nb IS NULL OR v_nb < 1 THEN
    RAISE EXCEPTION 'update_tae_transaction: slots requis';
  END IF;

  FOR j IN 0..(v_nb - 1) LOOP
    v_slot := p_payload->'slots'->j;
    IF (v_slot->>'mode') = 'reuse' THEN
      v_doc_ref := (v_slot->>'document_id')::uuid;
    ELSIF (v_slot->>'mode') = 'create' THEN
      v_doc_ref := v_new_ids[(v_slot->>'newIndex')::int + 1];
    ELSE
      RAISE EXCEPTION 'update_tae_transaction: mode de slot invalide';
    END IF;

    INSERT INTO tae_documents (tae_id, document_id, slot, ordre)
    VALUES (
      p_tae_id,
      v_doc_ref,
      v_slot->>'slot',
      (v_slot->>'ordre')::int
    );
  END LOOP;

  RETURN p_tae_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_tae_transaction(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tae_transaction(uuid, jsonb) TO service_role;
