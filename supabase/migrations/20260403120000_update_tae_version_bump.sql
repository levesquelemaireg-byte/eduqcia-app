-- Migration : câbler bump_tae_version dans update_tae_transaction (DOMAIN §9.1/9.2)
-- Détecte les modifications majeures (oi_id, comportement_id, cd_id,
-- connaissances_ids, niveau_id, discipline_id, documents) et appelle
-- bump_tae_version avant l'UPDATE, ce qui archive la version courante,
-- archive les votes actifs et incrémente tae.version.

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
  -- Versioning (DOMAIN §9.1/9.2)
  v_major_trigger  TEXT    := NULL;
  v_cur_oi         TEXT;
  v_cur_comp       TEXT;
  v_cur_cd         INT;
  v_cur_conn       INT[];
  v_cur_niveau     INT;
  v_cur_disc       INT;
  v_cur_doc_ids    UUID[];
  v_new_doc_ids    UUID[];
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
    RAISE EXCEPTION 'update_tae_transaction: tae utilisée dans une épreuve';
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

  -- --------------------------------------------------------
  -- Détection d'une modification majeure (DOMAIN §9.1/9.2)
  -- Champs majeurs : oi_id, comportement_id, cd_id,
  --   connaissances_ids, niveau_id, discipline_id, documents
  -- --------------------------------------------------------
  SELECT oi_id, comportement_id, cd_id, connaissances_ids, niveau_id, discipline_id
  INTO v_cur_oi, v_cur_comp, v_cur_cd, v_cur_conn, v_cur_niveau, v_cur_disc
  FROM tae WHERE id = p_tae_id;

  IF v_cur_oi IS DISTINCT FROM (p_payload->'tae'->>'oi_id') THEN
    v_major_trigger := 'oi_id';
  ELSIF v_cur_comp IS DISTINCT FROM (p_payload->'tae'->>'comportement_id') THEN
    v_major_trigger := 'comportement_id';
  ELSIF v_cur_cd IS DISTINCT FROM v_cd_id THEN
    v_major_trigger := 'cd_id';
  ELSIF v_cur_niveau IS DISTINCT FROM (p_payload->'tae'->>'niveau_id')::int THEN
    v_major_trigger := 'niveau_id';
  ELSIF v_cur_disc IS DISTINCT FROM (p_payload->'tae'->>'discipline_id')::int THEN
    v_major_trigger := 'discipline_id';
  ELSIF
    ARRAY(SELECT unnest(v_cur_conn) ORDER BY 1)
    IS DISTINCT FROM
    ARRAY(
      SELECT (jsonb_array_elements(p_payload->'tae'->'connaissances_ids'))::text::int
      ORDER BY 1
    )
  THEN
    v_major_trigger := 'connaissances_ids';
  END IF;

  -- Documents : nouveau document créé OU remplacement d'un slot existant
  IF v_major_trigger IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_payload->'slots') s
      WHERE s->>'mode' = 'create'
    ) THEN
      v_major_trigger := 'documents';
    ELSE
      v_cur_doc_ids := ARRAY(
        SELECT document_id FROM tae_documents WHERE tae_id = p_tae_id ORDER BY document_id
      );
      v_new_doc_ids := ARRAY(
        SELECT (s->>'document_id')::uuid
        FROM jsonb_array_elements(p_payload->'slots') s
        WHERE s->>'mode' = 'reuse'
        ORDER BY (s->>'document_id')::uuid
      );
      IF v_cur_doc_ids IS DISTINCT FROM v_new_doc_ids THEN
        v_major_trigger := 'documents';
      END IF;
    END IF;
  END IF;

  IF v_major_trigger IS NOT NULL THEN
    PERFORM bump_tae_version(p_tae_id, v_major_trigger);
  END IF;

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
      print_impression_scale,
      source_citation,
      source_type,
      image_legende,
      image_legende_position,
      repere_temporel,
      annee_normalisee,
      type_iconographique,
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
      CASE
        WHEN (v_elem->>'type') = 'iconographique' THEN
          LEAST(
            1.0::numeric,
            GREATEST(
              0.5::numeric,
              COALESCE(NULLIF(TRIM(COALESCE(v_elem->>'print_impression_scale', '')), '')::numeric, 1.0)
            )
          )
        ELSE 1.0::numeric
      END,
      v_elem->>'source_citation',
      CASE
        WHEN COALESCE(TRIM(v_elem->>'source_type'), '') IN ('primaire', 'secondaire') THEN
          TRIM(v_elem->>'source_type')::document_source_type
        ELSE 'secondaire'::document_source_type
      END,
      NULLIF(TRIM(COALESCE(v_elem->>'image_legende', '')), ''),
      CASE
        WHEN NULLIF(TRIM(COALESCE(v_elem->>'image_legende', '')), '') IS NULL THEN NULL::document_legend_position
        WHEN TRIM(COALESCE(v_elem->>'image_legende_position', '')) IN (
          'haut_gauche', 'haut_droite', 'bas_gauche', 'bas_droite'
        ) THEN TRIM(v_elem->>'image_legende_position')::document_legend_position
        ELSE NULL::document_legend_position
      END,
      NULLIF(TRIM(COALESCE(v_elem->>'repere_temporel', '')), ''),
      CASE
        WHEN NOT (v_elem ? 'annee_normalisee') OR jsonb_typeof(v_elem->'annee_normalisee') = 'null' THEN NULL::int
        WHEN TRIM(COALESCE(v_elem->>'annee_normalisee', '')) = '' THEN NULL::int
        WHEN TRIM(v_elem->>'annee_normalisee') ~ '^-?[0-9]+$' THEN TRIM(v_elem->>'annee_normalisee')::int
        ELSE NULL::int
      END,
      CASE
        WHEN (v_elem->>'type') = 'iconographique' THEN
          NULLIF(TRIM(COALESCE(v_elem->>'type_iconographique', '')), '')
        ELSE NULL
      END,
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
      FALSE,
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
    non_redaction_data = CASE
      WHEN p_payload->'tae' ? 'non_redaction_data'
      THEN (p_payload->'tae'->'non_redaction_data')::jsonb
      ELSE tae.non_redaction_data
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

  PERFORM apply_tae_collaborateurs_from_payload(p_tae_id, v_auteur, p_payload, TRUE);
  IF (p_payload->'tae'->>'conception_mode') = 'equipe' THEN
    IF NOT EXISTS (SELECT 1 FROM tae_collaborateurs WHERE tae_id = p_tae_id) THEN
      RAISE EXCEPTION 'update_tae_transaction: collaborateur actif requis (mode équipe)';
    END IF;
  END IF;

  RETURN p_tae_id;
END;
$$;
