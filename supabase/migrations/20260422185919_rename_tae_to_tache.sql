-- ============================================================================
-- Migration : rename tae → tache
-- ============================================================================
-- Renomme les tables, fonctions, policies, triggers, indexes et valeurs
-- d'enum dont le nom contient `tae` (acronyme) vers `tache` (mot français).
--
-- Scope :
--   - 7 tables (tae, tae_collaborateurs, tae_documents, tae_wizard_drafts,
--     tae_versions, tae_usages, evaluation_tae)
--   - 8 fonctions RPC / helpers renommées + 5 fonctions dont le body
--     référence ces tables et doit donc être recréé
--   - 40 policies RLS dropées et recréées (toutes les policies sur tables
--     renommées + policies sur autres tables dont le body référence tae)
--   - 2 triggers (trg_tae_updated_at, trg_tae_usages_updated_at)
--   - ~22 indexes
--   - Valeur d'enum favori_type 'tae' → 'tache'
--
-- Colonnes NON renommées (hors scope explicite) :
--   - tae_id, tae_version : les FK columns gardent leur nom, référencent
--     la table renommée `tache`.
--
-- Ordre d'exécution :
--   1. DROP policies (bodies référencent noms renommés)
--   2. DROP fonctions (bodies référencent tables renommées)
--   3. RENAME tables / indexes / triggers
--   4. RENAME valeur d'enum
--   5. CREATE nouvelles fonctions (avec bodies mis à jour)
--   6. GRANT execute
--   7. CREATE nouvelles policies (avec bodies mis à jour)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DROP POLICIES
-- ----------------------------------------------------------------------------

-- Policies sur tables renommées
DROP POLICY IF EXISTS "tae_select"                ON tae;
DROP POLICY IF EXISTS "tae_insert"                ON tae;
DROP POLICY IF EXISTS "tae_update"                ON tae;
DROP POLICY IF EXISTS "tae_delete"                ON tae;

DROP POLICY IF EXISTS "tae_wizard_drafts_select_own" ON tae_wizard_drafts;
DROP POLICY IF EXISTS "tae_wizard_drafts_insert_own" ON tae_wizard_drafts;
DROP POLICY IF EXISTS "tae_wizard_drafts_update_own" ON tae_wizard_drafts;
DROP POLICY IF EXISTS "tae_wizard_drafts_delete_own" ON tae_wizard_drafts;

DROP POLICY IF EXISTS "collab_select"             ON tae_collaborateurs;
DROP POLICY IF EXISTS "collab_manage_insert"      ON tae_collaborateurs;
DROP POLICY IF EXISTS "collab_manage_update"      ON tae_collaborateurs;
DROP POLICY IF EXISTS "collab_manage_delete"      ON tae_collaborateurs;

DROP POLICY IF EXISTS "tae_versions_select"       ON tae_versions;

DROP POLICY IF EXISTS "tae_docs_select"           ON tae_documents;
DROP POLICY IF EXISTS "tae_docs_insert"           ON tae_documents;
DROP POLICY IF EXISTS "tae_docs_update"           ON tae_documents;
DROP POLICY IF EXISTS "tae_docs_delete"           ON tae_documents;

DROP POLICY IF EXISTS "usages_select"             ON tae_usages;
DROP POLICY IF EXISTS "usages_write"              ON tae_usages;

DROP POLICY IF EXISTS "eval_tae_select"           ON evaluation_tae;
DROP POLICY IF EXISTS "eval_tae_write"            ON evaluation_tae;

-- Policies sur autres tables qui référencent tae dans leur body
DROP POLICY IF EXISTS "documents_select"          ON documents;
DROP POLICY IF EXISTS "documents_insert"          ON documents;
DROP POLICY IF EXISTS "documents_update"          ON documents;
DROP POLICY IF EXISTS "documents_delete"          ON documents;

DROP POLICY IF EXISTS "votes_select"              ON votes;
DROP POLICY IF EXISTS "votes_insert"              ON votes;
DROP POLICY IF EXISTS "votes_update_own"          ON votes;
DROP POLICY IF EXISTS "votes_delete_own"          ON votes;

DROP POLICY IF EXISTS "votes_arch_select"         ON votes_archives;

DROP POLICY IF EXISTS "comm_select"               ON commentaires;
DROP POLICY IF EXISTS "comm_insert"               ON commentaires;
DROP POLICY IF EXISTS "comm_update"               ON commentaires;

DROP POLICY IF EXISTS "eval_select"               ON evaluations;
DROP POLICY IF EXISTS "eval_insert"               ON evaluations;
DROP POLICY IF EXISTS "eval_update"               ON evaluations;
DROP POLICY IF EXISTS "eval_delete"               ON evaluations;

-- Storage bucket policies
DROP POLICY IF EXISTS "tae_doc_img_insert_own"    ON storage.objects;
DROP POLICY IF EXISTS "tae_doc_img_select_public" ON storage.objects;
DROP POLICY IF EXISTS "tae_doc_img_delete_own"    ON storage.objects;

-- ----------------------------------------------------------------------------
-- 2. DROP FUNCTIONS (bodies référencent tables à renommer)
-- ----------------------------------------------------------------------------

-- DROP TRIGGER dépendant de sync_usage_on_favori (sinon DROP FUNCTION échoue)
DROP TRIGGER IF EXISTS trg_favori_sync_usage ON favoris;

DROP FUNCTION IF EXISTS publish_tae_transaction(jsonb);
DROP FUNCTION IF EXISTS update_tae_transaction(uuid, jsonb);
DROP FUNCTION IF EXISTS auth_can_edit_tae(uuid);
DROP FUNCTION IF EXISTS tae_user_can_access_for_document_link(uuid);
DROP FUNCTION IF EXISTS auth_can_vote(uuid);
DROP FUNCTION IF EXISTS bump_tae_version(uuid, text);
DROP FUNCTION IF EXISTS record_tae_usage(uuid, boolean, boolean, boolean);
DROP FUNCTION IF EXISTS apply_tae_collaborateurs_from_payload(uuid, uuid, jsonb, boolean);

-- Fonctions non renommées mais dont le body référence tables renommées
DROP FUNCTION IF EXISTS delete_account_anonymize(uuid);
DROP FUNCTION IF EXISTS save_evaluation_composition(uuid, text, uuid[], boolean);
DROP FUNCTION IF EXISTS get_documents_enriched(jsonb);
DROP FUNCTION IF EXISTS sync_usage_on_favori();
DROP FUNCTION IF EXISTS inherit_metadata_to_source_doc(uuid, uuid);

-- ----------------------------------------------------------------------------
-- 3. RENAME TABLES
-- ----------------------------------------------------------------------------

ALTER TABLE tae                 RENAME TO tache;
ALTER TABLE tae_collaborateurs  RENAME TO tache_collaborateurs;
ALTER TABLE tae_documents       RENAME TO tache_documents;
ALTER TABLE tae_wizard_drafts   RENAME TO tache_wizard_drafts;
ALTER TABLE tae_versions        RENAME TO tache_versions;
ALTER TABLE tae_usages          RENAME TO tache_usages;
ALTER TABLE evaluation_tae      RENAME TO evaluation_tache;

-- ----------------------------------------------------------------------------
-- 4. RENAME INDEXES
-- ----------------------------------------------------------------------------

ALTER INDEX IF EXISTS idx_tae_wizard_drafts_user   RENAME TO idx_tache_wizard_drafts_user;
ALTER INDEX IF EXISTS idx_tae_consigne_search_trgm RENAME TO idx_tache_consigne_search_trgm;
ALTER INDEX IF EXISTS idx_tae_oi                   RENAME TO idx_tache_oi;
ALTER INDEX IF EXISTS idx_tae_comportement         RENAME TO idx_tache_comportement;
ALTER INDEX IF EXISTS idx_tae_niveau               RENAME TO idx_tache_niveau;
ALTER INDEX IF EXISTS idx_tae_discipline           RENAME TO idx_tache_discipline;
ALTER INDEX IF EXISTS idx_tae_aspects              RENAME TO idx_tache_aspects;
ALTER INDEX IF EXISTS idx_tae_connaissances        RENAME TO idx_tache_connaissances;
ALTER INDEX IF EXISTS idx_tae_auteur               RENAME TO idx_tache_auteur;
ALTER INDEX IF EXISTS idx_tae_published            RENAME TO idx_tache_published;
ALTER INDEX IF EXISTS idx_tae_active               RENAME TO idx_tache_active;
ALTER INDEX IF EXISTS idx_tae_version              RENAME TO idx_tache_version;
ALTER INDEX IF EXISTS idx_votes_tae                RENAME TO idx_votes_tache;
ALTER INDEX IF EXISTS idx_votes_tae_version        RENAME TO idx_votes_tache_version;
ALTER INDEX IF EXISTS idx_votes_arch_tae           RENAME TO idx_votes_arch_tache;
ALTER INDEX IF EXISTS idx_usages_tae_user          RENAME TO idx_usages_tache_user;
ALTER INDEX IF EXISTS idx_eval_tae_ordre           RENAME TO idx_eval_tache_ordre;
ALTER INDEX IF EXISTS idx_eval_tae_ref             RENAME TO idx_eval_tache_ref;
ALTER INDEX IF EXISTS idx_tae_auteur_published     RENAME TO idx_tache_auteur_published;
ALTER INDEX IF EXISTS idx_collab_tae               RENAME TO idx_collab_tache;
ALTER INDEX IF EXISTS idx_comm_tae                 RENAME TO idx_comm_tache;
ALTER INDEX IF EXISTS idx_tae_docs_tae             RENAME TO idx_tache_docs_tache;
ALTER INDEX IF EXISTS idx_tae_docs_document        RENAME TO idx_tache_docs_document;

-- ----------------------------------------------------------------------------
-- 5. RENAME TRIGGERS (sur tables renommées)
-- ----------------------------------------------------------------------------

ALTER TRIGGER trg_tae_updated_at        ON tache        RENAME TO trg_tache_updated_at;
ALTER TRIGGER trg_tae_usages_updated_at ON tache_usages RENAME TO trg_tache_usages_updated_at;

-- ----------------------------------------------------------------------------
-- 6. RENAME VALEUR D'ENUM
-- ----------------------------------------------------------------------------

ALTER TYPE favori_type RENAME VALUE 'tae' TO 'tache';

-- ============================================================================
-- 7. CREATE FONCTIONS (avec bodies mis à jour pour référencer tables renommées)
-- ============================================================================

CREATE OR REPLACE FUNCTION auth_can_edit_tache(p_tae_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1 FROM tache WHERE id = p_tae_id AND auteur_id = auth.uid()
    UNION ALL
    SELECT 1 FROM tache_collaborateurs WHERE tae_id = p_tae_id AND user_id = auth.uid()
  );
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION tache_user_can_access_for_document_link(p_tae_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1 FROM tache t
    WHERE t.id = p_tae_id
      AND (
        t.is_published
        OR t.auteur_id = auth.uid()
        OR auth_role() IN ('admin', 'conseiller_pedagogique')
        OR EXISTS (
          SELECT 1 FROM tache_collaborateurs tc
          WHERE tc.tae_id = p_tae_id AND tc.user_id = auth.uid()
        )
      )
  );
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION auth_can_vote(p_tae_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN (
    EXISTS (
      SELECT 1 FROM tache_usages
      WHERE tae_id = p_tae_id
        AND user_id = auth.uid()
        AND (pdf_downloaded OR added_to_eval OR favorited)
    )
    AND NOT EXISTS (
      SELECT 1 FROM tache WHERE id = p_tae_id AND auteur_id = auth.uid()
    )
  );
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION bump_tache_version(
  p_tae_id        UUID,
  p_trigger_field TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  t tache%ROWTYPE;
BEGIN
  SELECT * INTO t FROM tache WHERE id = p_tae_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'TAÉ introuvable : %', p_tae_id; END IF;

  -- 1. Archiver la version courante
  INSERT INTO tache_versions (
    tae_id, version,
    oi_id, comportement_id, cd_id, connaissances_ids,
    consigne, guidage, archived_by
  ) VALUES (
    t.id, t.version,
    t.oi_id, t.comportement_id, t.cd_id, t.connaissances_ids,
    t.consigne, t.guidage, auth.uid()
  )
  ON CONFLICT (tae_id, version) DO NOTHING;

  -- 2. Archiver les votes actifs
  INSERT INTO votes_archives (
    original_vote_id, tae_id, tae_version, votant_id,
    rigueur_historique, clarte_consigne, alignement_ministeriel, voted_at
  )
  SELECT id, tae_id, tae_version, votant_id,
         rigueur_historique, clarte_consigne, alignement_ministeriel, created_at
  FROM votes WHERE tae_id = p_tae_id;

  -- 3. Reset des votes actifs
  DELETE FROM votes WHERE tae_id = p_tae_id;

  -- 4. Incrément de version
  UPDATE tache SET
    version             = version + 1,
    version_updated_at  = NOW(),
    last_major_trigger  = p_trigger_field,
    updated_at          = NOW()
  WHERE id = p_tae_id;
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION inherit_metadata_to_source_doc(
  p_document_id UUID,
  p_tae_id      UUID
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  t tache%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM documents
    WHERE id = p_document_id AND source_document_id IS NULL
  ) THEN RETURN; END IF;

  SELECT * INTO t FROM tache WHERE id = p_tae_id;

  UPDATE documents SET
    niveaux_ids       = ARRAY(
      SELECT DISTINCT v FROM unnest(niveaux_ids || ARRAY[t.niveau_id]) v WHERE v IS NOT NULL
    ),
    disciplines_ids   = ARRAY(
      SELECT DISTINCT v FROM unnest(disciplines_ids || ARRAY[t.discipline_id]) v WHERE v IS NOT NULL
    ),
    aspects_societe   = ARRAY(
      SELECT DISTINCT v FROM unnest(aspects_societe || t.aspects_societe) v WHERE v IS NOT NULL
    )::aspect_societe[],
    connaissances_ids = ARRAY(
      SELECT DISTINCT v FROM unnest(connaissances_ids || t.connaissances_ids) v WHERE v IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = p_document_id;
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION record_tache_usage(
  p_tae_id         UUID,
  p_pdf_downloaded BOOLEAN DEFAULT FALSE,
  p_added_to_eval  BOOLEAN DEFAULT FALSE,
  p_favorited      BOOLEAN DEFAULT FALSE
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO tache_usages (tae_id, user_id, pdf_downloaded, added_to_eval, favorited)
  VALUES (p_tae_id, auth.uid(), p_pdf_downloaded, p_added_to_eval, p_favorited)
  ON CONFLICT (tae_id, user_id) DO UPDATE SET
    pdf_downloaded = tache_usages.pdf_downloaded OR EXCLUDED.pdf_downloaded,
    added_to_eval  = tache_usages.added_to_eval  OR EXCLUDED.added_to_eval,
    favorited      = tache_usages.favorited      OR EXCLUDED.favorited,
    updated_at     = NOW();
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION sync_usage_on_favori()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.type = 'tache' THEN
    PERFORM record_tache_usage(NEW.item_id, FALSE, FALSE, TRUE);
  END IF;
  RETURN NEW;
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION delete_account_anonymize(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  DELETE FROM tache WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM documents WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM evaluations WHERE auteur_id = p_user_id AND is_published = false;

  DELETE FROM profile_disciplines WHERE profile_id = p_user_id;
  DELETE FROM profile_niveaux WHERE profile_id = p_user_id;

  UPDATE profiles SET
    first_name = '[Compte',
    last_name = 'supprimé]',
    email = 'deleted-' || p_user_id || '@anonymized.local',
    school_id = NULL,
    years_experience = NULL,
    status = 'suspended',
    activation_token = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- ---
CREATE OR REPLACE FUNCTION apply_tache_collaborateurs_from_payload(
  p_tae_id uuid,
  p_auteur uuid,
  p_payload jsonb,
  p_delete_existing boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  j int;
  v_k int;
  v_uid uuid;
  v_text text;
BEGIN
  IF p_delete_existing THEN
    DELETE FROM tache_collaborateurs WHERE tae_id = p_tae_id;
  END IF;

  IF (p_payload->'tache'->>'conception_mode') IS DISTINCT FROM 'equipe' THEN
    RETURN;
  END IF;

  IF NOT (p_payload ? 'collaborateurs_user_ids')
     OR jsonb_typeof(p_payload->'collaborateurs_user_ids') IS DISTINCT FROM 'array' THEN
    RETURN;
  END IF;

  v_k := jsonb_array_length(p_payload->'collaborateurs_user_ids');
  FOR j IN 0..GREATEST(v_k - 1, -1) LOOP
    v_text := p_payload->'collaborateurs_user_ids'->>j;
    IF v_text IS NULL OR btrim(v_text) = '' THEN
      CONTINUE;
    END IF;
    BEGIN
      v_uid := v_text::uuid;
    EXCEPTION
      WHEN invalid_text_representation THEN
        CONTINUE;
    END;
    IF v_uid = p_auteur THEN
      CONTINUE;
    END IF;
    IF EXISTS (SELECT 1 FROM profiles WHERE id = v_uid AND status = 'active') THEN
      INSERT INTO tache_collaborateurs (tae_id, user_id, added_by)
      VALUES (p_tae_id, v_uid, p_auteur)
      ON CONFLICT (tae_id, user_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- ---
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

    INSERT INTO tache_documents (tae_id, document_id, slot, ordre)
    VALUES (
      v_tae_id,
      v_doc_ref,
      v_slot->>'slot',
      (v_slot->>'ordre')::int
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

-- ---
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

    INSERT INTO tache_documents (tae_id, document_id, slot, ordre)
    VALUES (
      p_tae_id,
      v_doc_ref,
      v_slot->>'slot',
      (v_slot->>'ordre')::int
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

-- ---
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
      RAISE EXCEPTION 'save_evaluation_composition: épreuve introuvable';
    END IF;
  END IF;

  FOREACH v_tae IN ARRAY p_tae_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM tache t
      WHERE t.id = v_tae
        AND t.is_archived = FALSE
        AND (
          t.is_published = TRUE
          OR t.auteur_id = v_uid
          OR EXISTS (
            SELECT 1 FROM tache_collaborateurs tc
            WHERE tc.tae_id = t.id AND tc.user_id = v_uid
          )
        )
    ) THEN
      RAISE EXCEPTION 'save_evaluation_composition: tâche non éligible';
    END IF;
  END LOOP;

  DELETE FROM evaluation_tache WHERE evaluation_id = v_eval_id;

  v_ordre := 0;
  FOREACH v_tae IN ARRAY p_tae_ids LOOP
    INSERT INTO evaluation_tache (evaluation_id, tae_id, ordre)
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

-- ---
CREATE OR REPLACE FUNCTION get_documents_enriched(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE (
  id                        UUID,
  titre                     TEXT,
  type                      doc_type,
  structure                 document_structure,
  elements                  JSONB,
  repere_temporel           TEXT,
  annee_normalisee          INT,
  niveaux_ids               INT[],
  disciplines_ids           INT[],
  aspects_societe           aspect_societe[],
  connaissances_ids         INT[],
  source_document_id        UUID,
  source_version            INT,
  is_modified               BOOLEAN,
  version                   INT,
  is_published              BOOLEAN,
  created_at                TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ,
  auteur_id                 UUID,
  niveaux_labels            TEXT[],
  disciplines_labels        TEXT[],
  connaissances_breadcrumbs JSONB,
  auteur                    JSONB,
  nb_utilisations           INT
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
DECLARE
  v_owner_id       UUID    := NULLIF(filters->>'owner_id', '')::UUID;
  v_profile_id     UUID    := NULLIF(filters->>'profile_id', '')::UUID;
  v_document_id    UUID    := NULLIF(filters->>'document_id', '')::UUID;
  v_include_drafts BOOLEAN := COALESCE((filters->>'include_drafts')::BOOLEAN, FALSE);
  v_niveau_ids     INT[]   := CASE
                                WHEN filters ? 'niveau_ids'
                                  THEN ARRAY(
                                    SELECT (v)::INT
                                    FROM jsonb_array_elements_text(filters->'niveau_ids') AS v
                                  )
                                ELSE NULL
                              END;
  v_discipline_ids INT[]   := CASE
                                WHEN filters ? 'discipline_ids'
                                  THEN ARRAY(
                                    SELECT (v)::INT
                                    FROM jsonb_array_elements_text(filters->'discipline_ids') AS v
                                  )
                                ELSE NULL
                              END;
  v_aspects        aspect_societe[] := CASE
                                WHEN filters ? 'aspects'
                                  THEN ARRAY(
                                    SELECT v::aspect_societe
                                    FROM jsonb_array_elements_text(filters->'aspects') AS v
                                  )
                                ELSE NULL
                              END;
  v_type           TEXT    := NULLIF(filters->>'type', '');
  v_search         TEXT    := NULLIF(TRIM(filters->>'search_query'), '');
  v_limit          INT     := COALESCE(NULLIF(filters->>'limit', '')::INT, 50);
  v_offset         INT     := COALESCE(NULLIF(filters->>'offset', '')::INT, 0);
  v_order_by       TEXT    := COALESCE(NULLIF(filters->>'order_by', ''), 'created_at_desc');
  v_search_pat     TEXT;
BEGIN
  IF v_search IS NOT NULL THEN
    v_search_pat := '%' ||
      REPLACE(REPLACE(REPLACE(v_search, '\', '\\'), '%', '\%'), '_', '\_') ||
      '%';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.titre,
    d.type,
    d.structure,
    d.elements,
    d.repere_temporel,
    d.annee_normalisee,
    d.niveaux_ids,
    d.disciplines_ids,
    d.aspects_societe,
    d.connaissances_ids,
    d.source_document_id,
    d.source_version,
    d.is_modified,
    d.version,
    d.is_published,
    d.created_at,
    d.updated_at,
    d.auteur_id,
    COALESCE(
      (
        SELECT array_agg(n.label ORDER BY n.ordre)
        FROM UNNEST(d.niveaux_ids) AS nid
        JOIN niveaux n ON n.id = nid
      ),
      ARRAY[]::TEXT[]
    ) AS niveaux_labels,
    COALESCE(
      (
        SELECT array_agg(disc.label ORDER BY disc.label)
        FROM UNNEST(d.disciplines_ids) AS did
        JOIN disciplines disc ON disc.id = did
      ),
      ARRAY[]::TEXT[]
    ) AS disciplines_labels,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id',              c.id,
            'realite_sociale', c.realite_sociale,
            'section',         c.section,
            'sous_section',    c.sous_section,
            'enonce',          c.enonce,
            'discipline_id',   c.discipline_id
          )
          ORDER BY c.realite_sociale, c.section, c.sous_section NULLS FIRST, c.enonce
        )
        FROM UNNEST(d.connaissances_ids) AS cid
        JOIN connaissances c ON c.id = cid
      ),
      '[]'::jsonb
    ) AS connaissances_breadcrumbs,
    jsonb_build_object(
      'id',           p.id,
      'first_name',   p.first_name,
      'last_name',    p.last_name,
      'display_name', NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), '')
    ) AS auteur,
    COALESCE(
      (
        SELECT COUNT(DISTINCT td.tae_id)::INT
        FROM tache_documents td
        JOIN tache t ON t.id = td.tae_id
        WHERE td.document_id = d.id
          AND t.is_published = TRUE
      ),
      0
    ) AS nb_utilisations
  FROM documents d
  LEFT JOIN profiles p ON p.id = d.auteur_id
  WHERE
    d.source_document_id IS NULL
    AND (v_document_id IS NULL OR d.id = v_document_id)
    AND (v_owner_id IS NULL OR d.auteur_id = v_owner_id)
    AND (v_profile_id IS NULL OR (d.auteur_id = v_profile_id AND d.is_published = TRUE))
    AND (
      v_include_drafts
      OR d.is_published = TRUE
      OR (v_owner_id IS NOT NULL AND d.auteur_id = v_owner_id)
    )
    AND (v_niveau_ids     IS NULL OR d.niveaux_ids     && v_niveau_ids)
    AND (v_discipline_ids IS NULL OR d.disciplines_ids && v_discipline_ids)
    AND (v_aspects        IS NULL OR d.aspects_societe && v_aspects)
    AND (v_type           IS NULL OR d.type::TEXT = v_type)
    AND (v_search_pat     IS NULL OR d.titre ILIKE v_search_pat)
  ORDER BY
    CASE WHEN v_order_by = 'created_at_desc' THEN d.created_at END DESC NULLS LAST,
    CASE WHEN v_order_by = 'created_at_asc'  THEN d.created_at END ASC  NULLS LAST,
    CASE WHEN v_order_by = 'updated_at_desc' THEN d.updated_at END DESC NULLS LAST,
    CASE WHEN v_order_by = 'titre_asc'       THEN d.titre      END ASC  NULLS LAST,
    d.id DESC
  LIMIT GREATEST(v_limit, 0)
  OFFSET GREATEST(v_offset, 0);
END;
$$;

-- ---

-- ============================================================================
-- 8. GRANTS sur fonctions recréées
-- ============================================================================

GRANT EXECUTE ON FUNCTION publish_tache_transaction(jsonb)        TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_tache_transaction(uuid, jsonb)   TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION bump_tache_version(uuid, text)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_tache_usage(uuid, boolean, boolean, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION apply_tache_collaborateurs_from_payload(uuid, uuid, jsonb, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION save_evaluation_composition(uuid, text, uuid[], boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_documents_enriched(jsonb)           TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_account_anonymize(uuid)          TO authenticated, service_role;

-- ============================================================================
-- 9. CREATE TRIGGER (recréation du seul trigger droppé : trg_favori_sync_usage)
-- ============================================================================

CREATE TRIGGER trg_favori_sync_usage
  AFTER INSERT ON favoris
  FOR EACH ROW EXECUTE FUNCTION sync_usage_on_favori();

-- ============================================================================
-- 10. CREATE POLICIES (avec bodies mis à jour)
-- ============================================================================


CREATE POLICY "tache_select"
  ON tache FOR SELECT
  USING (
    auth_is_active()
    AND (
      is_published = TRUE
      OR auteur_id = auth.uid()
      OR auth_role() IN ('admin', 'conseiller_pedagogique')
      OR EXISTS (
        SELECT 1 FROM tache_collaborateurs tc
        WHERE tc.tae_id = tache.id
          AND tc.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "tache_insert"
  ON tache FOR INSERT
  WITH CHECK (auth_is_active() AND auteur_id = auth.uid());

CREATE POLICY "tache_update"
  ON tache FOR UPDATE
  USING (auth_can_edit_tache(id) OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "tache_delete"
  ON tache FOR DELETE
  USING (auteur_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY "tache_wizard_drafts_select_own"
  ON tache_wizard_drafts FOR SELECT
  USING (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "tache_wizard_drafts_insert_own"
  ON tache_wizard_drafts FOR INSERT
  WITH CHECK (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "tache_wizard_drafts_update_own"
  ON tache_wizard_drafts FOR UPDATE
  USING (auth_is_active() AND user_id = auth.uid())
  WITH CHECK (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "tache_wizard_drafts_delete_own"
  ON tache_wizard_drafts FOR DELETE
  USING (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "collab_select"
  ON tache_collaborateurs FOR SELECT
  USING (auth_is_active());

CREATE POLICY "collab_manage_insert"
  ON tache_collaborateurs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

CREATE POLICY "collab_manage_update"
  ON tache_collaborateurs FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

CREATE POLICY "collab_manage_delete"
  ON tache_collaborateurs FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

CREATE POLICY "tache_versions_select"
  ON tache_versions FOR SELECT
  USING (
    auth_is_active()
    AND (
      EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
      OR auth_role() IN ('admin', 'conseiller_pedagogique')
    )
  );

CREATE POLICY "tache_docs_select"
  ON tache_documents FOR SELECT
  USING (
    auth_is_active()
    AND tache_user_can_access_for_document_link(tae_id)
  );

CREATE POLICY "tache_docs_insert"
  ON tache_documents FOR INSERT
  WITH CHECK (auth_can_edit_tache(tae_id) OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "tache_docs_update"
  ON tache_documents FOR UPDATE
  USING (auth_can_edit_tache(tae_id) OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "tache_docs_delete"
  ON tache_documents FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

CREATE POLICY "documents_select"
  ON documents FOR SELECT
  USING (
    auth_is_active()
    AND (
      is_published = TRUE
      OR auteur_id = auth.uid()
      OR auth_role() IN ('admin', 'conseiller_pedagogique')
    )
  );

CREATE POLICY "documents_insert"
  ON documents FOR INSERT
  WITH CHECK (auth_is_active() AND auteur_id = auth.uid());

CREATE POLICY "documents_update"
  ON documents FOR UPDATE
  USING (auteur_id = auth.uid() OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "documents_delete"
  ON documents FOR DELETE
  USING (auteur_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY "votes_select"
  ON votes FOR SELECT
  USING (auth_is_active());

CREATE POLICY "votes_insert"
  ON votes FOR INSERT
  WITH CHECK (
    auth_is_active()
    AND votant_id = auth.uid()
    AND auth_can_vote(tae_id)
  );

CREATE POLICY "votes_update_own"
  ON votes FOR UPDATE
  USING (votant_id = auth.uid())
  WITH CHECK (votant_id = auth.uid());

CREATE POLICY "votes_delete_own"
  ON votes FOR DELETE
  USING (votant_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY "votes_arch_select"
  ON votes_archives FOR SELECT
  USING (
    votant_id = auth.uid()
    OR auth_role() IN ('admin', 'conseiller_pedagogique')
    OR EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND auteur_id = auth.uid())
  );

CREATE POLICY "usages_select"
  ON tache_usages FOR SELECT
  USING (user_id = auth.uid() OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "usages_write"
  ON tache_usages FOR ALL
  USING  (user_id = auth.uid() OR auth_role() = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY "comm_select"
  ON commentaires FOR SELECT
  USING (
    auth_is_active()
    AND is_deleted = FALSE
    AND EXISTS (SELECT 1 FROM tache WHERE id = tae_id AND is_published = TRUE)
  );

CREATE POLICY "comm_insert"
  ON commentaires FOR INSERT
  WITH CHECK (auth_is_active() AND auteur_id = auth.uid());

CREATE POLICY "comm_update"
  ON commentaires FOR UPDATE
  USING (auteur_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY "eval_select"
  ON evaluations FOR SELECT
  USING (
    auth_is_active()
    AND (
      is_published = TRUE
      OR auteur_id = auth.uid()
      OR auth_role() IN ('admin', 'conseiller_pedagogique')
    )
  );

CREATE POLICY "eval_insert"
  ON evaluations FOR INSERT
  WITH CHECK (auth_is_active() AND auteur_id = auth.uid());

CREATE POLICY "eval_update"
  ON evaluations FOR UPDATE
  USING (auteur_id = auth.uid() OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "eval_delete"
  ON evaluations FOR DELETE
  USING (auteur_id = auth.uid() OR auth_role() = 'admin');

CREATE POLICY "eval_tache_select"
  ON evaluation_tache FOR SELECT
  USING (
    auth_is_active()
    AND EXISTS (
      SELECT 1 FROM evaluations e WHERE e.id = evaluation_id
        AND (e.is_published OR e.auteur_id = auth.uid()
             OR auth_role() IN ('admin', 'conseiller_pedagogique'))
    )
  );

CREATE POLICY "eval_tache_write"
  ON evaluation_tache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = evaluation_id AND e.auteur_id = auth.uid()
    )
    OR auth_role() = 'admin'
  );

CREATE POLICY "tache_doc_img_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tae-document-images'
    AND name LIKE (auth.uid()::text || '/%')
  );

CREATE POLICY "tache_doc_img_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'tae-document-images');

CREATE POLICY "tache_doc_img_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'tae-document-images'
    AND name LIKE (auth.uid()::text || '/%')
  );

