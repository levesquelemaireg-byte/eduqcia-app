-- Migration : colonne elements JSONB sur documents, suppression document_elements.
--
-- Remplace les colonnes flat d'éléments + la table document_elements par une
-- seule colonne `elements JSONB NOT NULL DEFAULT '[]'` sur documents.
-- Les éléments ne sont jamais requêtés indépendamment — cas textbook JSONB.

-- ---------------------------------------------------------------------------
-- 1. Ajouter la colonne elements
-- ---------------------------------------------------------------------------

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS elements JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN documents.elements IS
  'Éléments du document en JSONB. 1 élément pour simple, 2–3 pour perspectives, 2 pour deux_temps. Chaque élément : { type, contenu?, image_url?, source_citation, source_type, categorie_textuelle?, categorie_iconographique?, image_legende?, image_legende_position?, auteur?, repere_temporel?, sous_titre? }.';

-- ---------------------------------------------------------------------------
-- 2. Migrer les données : document_elements → elements JSONB (multi-éléments)
-- ---------------------------------------------------------------------------

UPDATE documents d SET elements = sub.els
FROM (
  SELECT e.document_id,
         jsonb_agg(
           jsonb_strip_nulls(jsonb_build_object(
             'type',                      e.type,
             'contenu',                   e.contenu,
             'image_url',                 e.image_url,
             'source_citation',           e.source_citation,
             'source_type',               e.source_type::text,
             'categorie_textuelle',       e.categorie_textuelle::text,
             'categorie_iconographique',  e.categorie_iconographique,
             'image_legende',             e.legende,
             'image_legende_position',    e.legende_position::text,
             'auteur',                    e.auteur,
             'repere_temporel',           e.repere_temporel,
             'sous_titre',                e.sous_titre
           )) ORDER BY e.position
         ) AS els
  FROM document_elements e
  GROUP BY e.document_id
) sub
WHERE d.id = sub.document_id;

-- ---------------------------------------------------------------------------
-- 3. Migrer les données : colonnes flat → elements JSONB (documents sans éléments)
-- ---------------------------------------------------------------------------

UPDATE documents SET elements = jsonb_build_array(
  jsonb_strip_nulls(jsonb_build_object(
    'type',                      type::text,
    'contenu',                   contenu,
    'image_url',                 image_url,
    'source_citation',           source_citation,
    'source_type',               source_type::text,
    'categorie_textuelle',       categorie_textuelle::text,
    'categorie_iconographique',  type_iconographique,
    'image_legende',             image_legende,
    'image_legende_position',    image_legende_position::text
  ))
)
WHERE elements = '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- 4. Supprimer la table document_elements
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS document_elements CASCADE;

-- ---------------------------------------------------------------------------
-- 5. Supprimer les colonnes flat d'éléments de documents
-- ---------------------------------------------------------------------------

ALTER TABLE documents
  DROP COLUMN IF EXISTS contenu,
  DROP COLUMN IF EXISTS image_url,
  DROP COLUMN IF EXISTS source_citation,
  DROP COLUMN IF EXISTS source_type,
  DROP COLUMN IF EXISTS image_legende,
  DROP COLUMN IF EXISTS image_legende_position,
  DROP COLUMN IF EXISTS type_iconographique,
  DROP COLUMN IF EXISTS categorie_textuelle;

-- ---------------------------------------------------------------------------
-- 6. Mettre à jour publish_tae_transaction
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION publish_tae_transaction(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
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
  i int;
  j int;
  v_len int;
  v_nb int;
BEGIN
  v_auteur := (p_payload->>'auteur_id')::uuid;
  IF v_auteur IS NULL OR v_auteur <> auth.uid() THEN
    RAISE EXCEPTION 'publish_tae_transaction: auteur_id invalide';
  END IF;

  IF NOT (p_payload ? 'tae' AND p_payload ? 'documents_new' AND p_payload ? 'slots') THEN
    RAISE EXCEPTION 'publish_tae_transaction: payload incomplet';
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

  INSERT INTO tae (
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
    is_published,
    updated_at
  ) VALUES (
    v_auteur,
    (p_payload->'tae'->>'conception_mode')::conception_mode,
    p_payload->'tae'->>'oi_id',
    p_payload->'tae'->>'comportement_id',
    v_cd_id,
    COALESCE(
      ARRAY(SELECT (jsonb_array_elements(p_payload->'tae'->'connaissances_ids'))::text::int),
      ARRAY[]::int[]
    ),
    p_payload->'tae'->>'consigne',
    NULLIF(p_payload->'tae'->>'guidage', ''),
    NULLIF(p_payload->'tae'->>'corrige', ''),
    CASE
      WHEN NOT (p_payload->'tae' ? 'nb_lignes') THEN NULL
      WHEN jsonb_typeof(p_payload->'tae'->'nb_lignes') = 'null' THEN NULL
      ELSE (p_payload->'tae'->'nb_lignes')::text::int
    END,
    CASE
      WHEN NOT (p_payload->'tae' ? 'non_redaction_data') THEN NULL
      WHEN jsonb_typeof(p_payload->'tae'->'non_redaction_data') = 'null' THEN NULL
      ELSE (p_payload->'tae'->'non_redaction_data')::jsonb
    END,
    (p_payload->'tae'->>'niveau_id')::int,
    (p_payload->'tae'->>'discipline_id')::int,
    v_aspects,
    TRUE,
    NOW()
  )
  RETURNING id INTO v_tae_id;

  v_nb := jsonb_array_length(p_payload->'slots');
  IF v_nb IS NULL OR v_nb < 1 THEN
    RAISE EXCEPTION 'publish_tae_transaction: slots requis';
  END IF;

  FOR j IN 0..(v_nb - 1) LOOP
    v_slot := p_payload->'slots'->j;
    IF (v_slot->>'mode') = 'reuse' THEN
      v_doc_ref := (v_slot->>'document_id')::uuid;
    ELSIF (v_slot->>'mode') = 'create' THEN
      v_doc_ref := v_new_ids[(v_slot->>'newIndex')::int + 1];
    ELSE
      RAISE EXCEPTION 'publish_tae_transaction: mode de slot invalide';
    END IF;

    INSERT INTO tae_documents (tae_id, document_id, slot, ordre)
    VALUES (
      v_tae_id,
      v_doc_ref,
      v_slot->>'slot',
      (v_slot->>'ordre')::int
    );
  END LOOP;

  PERFORM apply_tae_collaborateurs_from_payload(v_tae_id, v_auteur, p_payload, FALSE);
  IF (p_payload->'tae'->>'conception_mode') = 'equipe' THEN
    IF NOT EXISTS (SELECT 1 FROM tae_collaborateurs WHERE tae_id = v_tae_id) THEN
      RAISE EXCEPTION 'publish_tae_transaction: collaborateur actif requis (mode équipe)';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'tae_wizard_drafts'
  ) THEN
    DELETE FROM tae_wizard_drafts WHERE user_id = v_auteur;
  END IF;

  RETURN v_tae_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. Mettre à jour update_tae_transaction
-- ---------------------------------------------------------------------------

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
