-- Phase 3 Section B — persistance des champs du schéma de caractérisation par les RPC.
--
-- Étend `publish_tache_transaction` et `update_tache_transaction` pour sérialiser
-- les nouveaux champs introduits par la migration 20260423100000_schema_cd1_data.sql :
--
--   - tache.type_tache         ← p_payload->'tache'->>'type_tache' (fallback 'section_a')
--   - tache.schema_cd1_data    ← p_payload->'tache'->'schema_cd1_data' (nullable)
--   - tache_documents.est_leurre        ← v_slot->>'est_leurre' (fallback false)
--   - tache_documents.cases_associees   ← v_slot->'cases_associees' (fallback tableau vide)
--
-- CREATE OR REPLACE FUNCTION — la signature reste identique, seul le corps change.

-- ============================================================
-- publish_tache_transaction
-- ============================================================

CREATE OR REPLACE FUNCTION publish_tache_transaction(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
-- SECURITY DEFINER + désactivation RLS dans le corps : évite la récursion infinie entre
-- tache_docs_write → auth_can_edit_tache() → SELECT sur tache → tache_select / collaborateurs.
-- L’auteur est forcé à auth.uid() avant toute écriture.
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auteur uuid;
  v_tae_id uuid;
  v_doc_id uuid;
  v_new_ids uuid[] := ARRAY[]::uuid[];
  v_slot jsonb;
  v_doc_ref uuid;
  v_elem jsonb;
  v_aspects aspect_societe[];
  v_cd_id int;
  v_type_tache text;
  v_cases text[];
  i int;
  j int;
  v_len int;
  v_nb int;
BEGIN
  v_auteur := (p_payload->>'auteur_id')::uuid;
  IF v_auteur IS NULL OR v_auteur <> auth.uid() THEN
    RAISE EXCEPTION 'publish_tache_transaction: auteur_id invalide';
  END IF;

  IF NOT (p_payload ? 'tache' AND p_payload ? 'documents_new' AND p_payload ? 'slots') THEN
    RAISE EXCEPTION 'publish_tache_transaction: payload incomplet';
  END IF;

  -- Réservé au rôle propriétaire de la fonction (postgres) : contourne RLS pour cette transaction locale uniquement.
  PERFORM set_config('row_security', 'off', true);

  SELECT COALESCE(
    (SELECT array_agg((value #>> '{}')::aspect_societe)
     FROM jsonb_array_elements(p_payload->'tache'->'aspects_societe') AS t(value)),
    ARRAY[]::aspect_societe[]
  )
  INTO v_aspects;

  v_cd_id := CASE
    WHEN NOT (p_payload->'tache' ? 'cd_id') THEN NULL
    WHEN jsonb_typeof(p_payload->'tache'->'cd_id') = 'null' THEN NULL
    ELSE (p_payload->'tache'->'cd_id')::text::int
  END;

  v_type_tache := CASE
    WHEN NOT (p_payload->'tache' ? 'type_tache') THEN 'section_a'
    WHEN jsonb_typeof(p_payload->'tache'->'type_tache') = 'null' THEN 'section_a'
    WHEN p_payload->'tache'->>'type_tache' IN ('section_a', 'section_b', 'section_c')
      THEN p_payload->'tache'->>'type_tache'
    ELSE 'section_a'
  END;

  v_len := COALESCE(jsonb_array_length(p_payload->'documents_new'), 0);
  FOR i IN 0..GREATEST(v_len - 1, -1) LOOP
    v_elem := p_payload->'documents_new'->i;
    INSERT INTO documents (
      auteur_id,
      source_document_id,
      titre,
      type,
      elements,
      print_impression_scale,
      repere_temporel,
      annee_normalisee,
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
      COALESCE(v_elem->'elements', '[]'::jsonb),
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
      NULLIF(TRIM(COALESCE(v_elem->>'repere_temporel', '')), ''),
      CASE
        WHEN NOT (v_elem ? 'annee_normalisee') OR jsonb_typeof(v_elem->'annee_normalisee') = 'null' THEN NULL::int
        WHEN TRIM(COALESCE(v_elem->>'annee_normalisee', '')) = '' THEN NULL::int
        WHEN TRIM(v_elem->>'annee_normalisee') ~ '^-?[0-9]+$' THEN TRIM(v_elem->>'annee_normalisee')::int
        ELSE NULL::int
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

  INSERT INTO tache (
    auteur_id,
    conception_mode,
    oi_id,
    comportement_id,
    cd_id,
    connaissances_ids,
    consigne,
    guidage,
    corrige,
    nb_lignes,
    non_redaction_data,
    niveau_id,
    discipline_id,
    aspects_societe,
    type_tache,
    schema_cd1_data,
    is_published,
    updated_at
  ) VALUES (
    v_auteur,
    (p_payload->'tache'->>'conception_mode')::conception_mode,
    p_payload->'tache'->>'oi_id',
    p_payload->'tache'->>'comportement_id',
    v_cd_id,
    COALESCE(
      ARRAY(SELECT (jsonb_array_elements(p_payload->'tache'->'connaissances_ids'))::text::int),
      ARRAY[]::int[]
    ),
    p_payload->'tache'->>'consigne',
    NULLIF(p_payload->'tache'->>'guidage', ''),
    NULLIF(p_payload->'tache'->>'corrige', ''),
    CASE
      WHEN NOT (p_payload->'tache' ? 'nb_lignes') THEN NULL
      WHEN jsonb_typeof(p_payload->'tache'->'nb_lignes') = 'null' THEN NULL
      ELSE (p_payload->'tache'->'nb_lignes')::text::int
    END,
    CASE
      WHEN NOT (p_payload->'tache' ? 'non_redaction_data') THEN NULL
      WHEN jsonb_typeof(p_payload->'tache'->'non_redaction_data') = 'null' THEN NULL
      ELSE (p_payload->'tache'->'non_redaction_data')::jsonb
    END,
    (p_payload->'tache'->>'niveau_id')::int,
    (p_payload->'tache'->>'discipline_id')::int,
    v_aspects,
    v_type_tache,
    CASE
      WHEN NOT (p_payload->'tache' ? 'schema_cd1_data') THEN NULL
      WHEN jsonb_typeof(p_payload->'tache'->'schema_cd1_data') = 'null' THEN NULL
      ELSE (p_payload->'tache'->'schema_cd1_data')::jsonb
    END,
    TRUE,
    NOW()
  )
  RETURNING id INTO v_tae_id;

  v_nb := jsonb_array_length(p_payload->'slots');
  IF v_nb IS NULL OR v_nb < 1 THEN
    RAISE EXCEPTION 'publish_tache_transaction: slots requis';
  END IF;

  FOR j IN 0..(v_nb - 1) LOOP
    v_slot := p_payload->'slots'->j;
    IF (v_slot->>'mode') = 'reuse' THEN
      v_doc_ref := (v_slot->>'document_id')::uuid;
    ELSIF (v_slot->>'mode') = 'create' THEN
      v_doc_ref := v_new_ids[(v_slot->>'newIndex')::int + 1];
    ELSE
      RAISE EXCEPTION 'publish_tache_transaction: mode de slot invalide';
    END IF;

    v_cases := CASE
      WHEN NOT (v_slot ? 'cases_associees') THEN ARRAY[]::text[]
      WHEN jsonb_typeof(v_slot->'cases_associees') <> 'array' THEN ARRAY[]::text[]
      ELSE COALESCE(
        ARRAY(SELECT value #>> '{}' FROM jsonb_array_elements(v_slot->'cases_associees') AS t(value)),
        ARRAY[]::text[]
      )
    END;

    INSERT INTO tache_documents (tae_id, document_id, slot, ordre, est_leurre, cases_associees)
    VALUES (
      v_tae_id,
      v_doc_ref,
      v_slot->>'slot',
      (v_slot->>'ordre')::int,
      COALESCE((v_slot->>'est_leurre')::boolean, FALSE),
      v_cases
    );
  END LOOP;

  PERFORM apply_tache_collaborateurs_from_payload(v_tae_id, v_auteur, p_payload, FALSE);
  IF (p_payload->'tache'->>'conception_mode') = 'equipe' THEN
    IF NOT EXISTS (SELECT 1 FROM tache_collaborateurs WHERE tae_id = v_tae_id) THEN
      RAISE EXCEPTION 'publish_tache_transaction: collaborateur actif requis (mode équipe)';
    END IF;
  END IF;

  -- Brouillon wizard : si la table n’est pas encore migrée sur le projet Supabase, ne pas faire échouer la publication.
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'tache_wizard_drafts'
  ) THEN
    DELETE FROM tache_wizard_drafts WHERE user_id = v_auteur;
  END IF;

  RETURN v_tae_id;
END;
$$;

GRANT EXECUTE ON FUNCTION publish_tache_transaction(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION publish_tache_transaction(jsonb) TO service_role;

-- ============================================================
-- update_tache_transaction
-- ============================================================

CREATE OR REPLACE FUNCTION update_tache_transaction(p_tae_id uuid, p_payload jsonb)
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
  v_type_tache text;
  v_cases text[];
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
    RAISE EXCEPTION 'update_tache_transaction: auteur_id invalide';
  END IF;

  IF NOT (p_payload ? 'tache' AND p_payload ? 'documents_new' AND p_payload ? 'slots') THEN
    RAISE EXCEPTION 'update_tache_transaction: payload incomplet';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM tache WHERE id = p_tae_id AND auteur_id = v_auteur) THEN
    RAISE EXCEPTION 'update_tache_transaction: tache introuvable ou interdit';
  END IF;

  IF EXISTS (SELECT 1 FROM evaluation_tache WHERE tae_id = p_tae_id) THEN
    RAISE EXCEPTION 'update_tache_transaction: tache utilisée dans une épreuve';
  END IF;

  PERFORM set_config('row_security', 'off', true);

  SELECT COALESCE(
    (SELECT array_agg((value #>> '{}')::aspect_societe)
     FROM jsonb_array_elements(p_payload->'tache'->'aspects_societe') AS t(value)),
    ARRAY[]::aspect_societe[]
  )
  INTO v_aspects;

  v_cd_id := CASE
    WHEN NOT (p_payload->'tache' ? 'cd_id') THEN NULL
    WHEN jsonb_typeof(p_payload->'tache'->'cd_id') = 'null' THEN NULL
    ELSE (p_payload->'tache'->'cd_id')::text::int
  END;

  v_type_tache := CASE
    WHEN NOT (p_payload->'tache' ? 'type_tache') THEN 'section_a'
    WHEN jsonb_typeof(p_payload->'tache'->'type_tache') = 'null' THEN 'section_a'
    WHEN p_payload->'tache'->>'type_tache' IN ('section_a', 'section_b', 'section_c')
      THEN p_payload->'tache'->>'type_tache'
    ELSE 'section_a'
  END;

  -- --------------------------------------------------------
  -- Détection d'une modification majeure (DOMAIN §9.1/9.2)
  -- Champs majeurs : oi_id, comportement_id, cd_id,
  --   connaissances_ids, niveau_id, discipline_id, documents
  -- --------------------------------------------------------
  SELECT oi_id, comportement_id, cd_id, connaissances_ids, niveau_id, discipline_id
  INTO v_cur_oi, v_cur_comp, v_cur_cd, v_cur_conn, v_cur_niveau, v_cur_disc
  FROM tache WHERE id = p_tae_id;

  IF v_cur_oi IS DISTINCT FROM (p_payload->'tache'->>'oi_id') THEN
    v_major_trigger := 'oi_id';
  ELSIF v_cur_comp IS DISTINCT FROM (p_payload->'tache'->>'comportement_id') THEN
    v_major_trigger := 'comportement_id';
  ELSIF v_cur_cd IS DISTINCT FROM v_cd_id THEN
    v_major_trigger := 'cd_id';
  ELSIF v_cur_niveau IS DISTINCT FROM (p_payload->'tache'->>'niveau_id')::int THEN
    v_major_trigger := 'niveau_id';
  ELSIF v_cur_disc IS DISTINCT FROM (p_payload->'tache'->>'discipline_id')::int THEN
    v_major_trigger := 'discipline_id';
  ELSIF
    ARRAY(SELECT unnest(v_cur_conn) ORDER BY 1)
    IS DISTINCT FROM
    ARRAY(
      SELECT (jsonb_array_elements(p_payload->'tache'->'connaissances_ids'))::text::int
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
        SELECT document_id FROM tache_documents WHERE tae_id = p_tae_id ORDER BY document_id
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
    PERFORM bump_tache_version(p_tae_id, v_major_trigger);
  END IF;

  v_len := COALESCE(jsonb_array_length(p_payload->'documents_new'), 0);
  FOR i IN 0..GREATEST(v_len - 1, -1) LOOP
    v_elem := p_payload->'documents_new'->i;
    INSERT INTO documents (
      auteur_id,
      source_document_id,
      titre,
      type,
      elements,
      print_impression_scale,
      repere_temporel,
      annee_normalisee,
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
      COALESCE(v_elem->'elements', '[]'::jsonb),
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
      NULLIF(TRIM(COALESCE(v_elem->>'repere_temporel', '')), ''),
      CASE
        WHEN NOT (v_elem ? 'annee_normalisee') OR jsonb_typeof(v_elem->'annee_normalisee') = 'null' THEN NULL::int
        WHEN TRIM(COALESCE(v_elem->>'annee_normalisee', '')) = '' THEN NULL::int
        WHEN TRIM(v_elem->>'annee_normalisee') ~ '^-?[0-9]+$' THEN TRIM(v_elem->>'annee_normalisee')::int
        ELSE NULL::int
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

  UPDATE tache SET
    conception_mode = (p_payload->'tache'->>'conception_mode')::conception_mode,
    oi_id = p_payload->'tache'->>'oi_id',
    comportement_id = p_payload->'tache'->>'comportement_id',
    cd_id = v_cd_id,
    connaissances_ids = COALESCE(
      ARRAY(SELECT (jsonb_array_elements(p_payload->'tache'->'connaissances_ids'))::text::int),
      ARRAY[]::int[]
    ),
    consigne = p_payload->'tache'->>'consigne',
    guidage = NULLIF(p_payload->'tache'->>'guidage', ''),
    corrige = NULLIF(p_payload->'tache'->>'corrige', ''),
    nb_lignes = CASE
      WHEN NOT (p_payload->'tache' ? 'nb_lignes') THEN NULL
      WHEN jsonb_typeof(p_payload->'tache'->'nb_lignes') = 'null' THEN NULL
      ELSE (p_payload->'tache'->'nb_lignes')::text::int
    END,
    non_redaction_data = CASE
      WHEN p_payload->'tache' ? 'non_redaction_data'
      THEN (p_payload->'tache'->'non_redaction_data')::jsonb
      ELSE tache.non_redaction_data
    END,
    niveau_id = (p_payload->'tache'->>'niveau_id')::int,
    discipline_id = (p_payload->'tache'->>'discipline_id')::int,
    aspects_societe = v_aspects,
    type_tache = v_type_tache,
    schema_cd1_data = CASE
      WHEN NOT (p_payload->'tache' ? 'schema_cd1_data') THEN tache.schema_cd1_data
      WHEN jsonb_typeof(p_payload->'tache'->'schema_cd1_data') = 'null' THEN NULL
      ELSE (p_payload->'tache'->'schema_cd1_data')::jsonb
    END,
    updated_at = NOW()
  WHERE id = p_tae_id;

  DELETE FROM tache_documents WHERE tae_id = p_tae_id;

  v_nb := jsonb_array_length(p_payload->'slots');
  IF v_nb IS NULL OR v_nb < 1 THEN
    RAISE EXCEPTION 'update_tache_transaction: slots requis';
  END IF;

  FOR j IN 0..(v_nb - 1) LOOP
    v_slot := p_payload->'slots'->j;
    IF (v_slot->>'mode') = 'reuse' THEN
      v_doc_ref := (v_slot->>'document_id')::uuid;
    ELSIF (v_slot->>'mode') = 'create' THEN
      v_doc_ref := v_new_ids[(v_slot->>'newIndex')::int + 1];
    ELSE
      RAISE EXCEPTION 'update_tache_transaction: mode de slot invalide';
    END IF;

    v_cases := CASE
      WHEN NOT (v_slot ? 'cases_associees') THEN ARRAY[]::text[]
      WHEN jsonb_typeof(v_slot->'cases_associees') <> 'array' THEN ARRAY[]::text[]
      ELSE COALESCE(
        ARRAY(SELECT value #>> '{}' FROM jsonb_array_elements(v_slot->'cases_associees') AS t(value)),
        ARRAY[]::text[]
      )
    END;

    INSERT INTO tache_documents (tae_id, document_id, slot, ordre, est_leurre, cases_associees)
    VALUES (
      p_tae_id,
      v_doc_ref,
      v_slot->>'slot',
      (v_slot->>'ordre')::int,
      COALESCE((v_slot->>'est_leurre')::boolean, FALSE),
      v_cases
    );
  END LOOP;

  PERFORM apply_tache_collaborateurs_from_payload(p_tae_id, v_auteur, p_payload, TRUE);
  IF (p_payload->'tache'->>'conception_mode') = 'equipe' THEN
    IF NOT EXISTS (SELECT 1 FROM tache_collaborateurs WHERE tae_id = p_tae_id) THEN
      RAISE EXCEPTION 'update_tache_transaction: collaborateur actif requis (mode équipe)';
    END IF;
  END IF;

  RETURN p_tae_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_tache_transaction(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tache_transaction(uuid, jsonb) TO service_role;
