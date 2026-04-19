-- RPC get_documents_enriched(filters jsonb)
-- Source de vérité unique pour lister les documents avec leurs métadonnées enrichies
-- (niveaux/disciplines labels, connaissances breadcrumbs, auteur, nb_utilisations).
--
-- Respecte les RLS existantes via SECURITY INVOKER (documents_select, profiles_select,
-- tae_select). Tous les filtres sont appliqués conditionnellement : une clé absente
-- dans le jsonb ne produit aucun filtre.
--
-- Contextes d'appel :
--   - Banque collaborative       → { include_drafts:false, ... filtres recherche }
--   - Mes documents (owner)      → { owner_id: auth.uid(), include_drafts:true }
--   - Profil collègue (profile)  → { profile_id: <uuid>, include_drafts:false }
--   - Lecture unitaire           → { owner_id | profile_id, limit:1 }
--
-- Clés reconnues dans filters (toutes optionnelles) :
--   owner_id         UUID       — restreint aux documents de cet auteur
--   profile_id       UUID       — restreint aux documents publiés de cet auteur
--   include_drafts   BOOLEAN    — inclut les brouillons (défaut false)
--   niveau_ids       INT[]      — overlap avec niveaux_ids
--   discipline_ids   INT[]      — overlap avec disciplines_ids
--   aspects          aspect_societe[] — overlap avec aspects_societe
--   type             TEXT       — 'textuel' | 'iconographique'
--   search_query     TEXT       — ILIKE sur titre
--   document_id      UUID       — récupère un document précis
--   limit            INT        — défaut 50
--   offset           INT        — défaut 0
--   order_by         TEXT       — 'created_at_desc' | 'created_at_asc' | 'updated_at_desc' | 'titre_asc'

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
        FROM tae_documents td
        JOIN tae t ON t.id = td.tae_id
        WHERE td.document_id = d.id
          AND t.is_published = TRUE
      ),
      0
    ) AS nb_utilisations
  FROM documents d
  LEFT JOIN profiles p ON p.id = d.auteur_id
  WHERE
    -- Masters uniquement : les métadonnées (niveaux_ids, etc.) ne sont portées que par eux.
    d.source_document_id IS NULL
    -- Document précis (court-circuit)
    AND (v_document_id IS NULL OR d.id = v_document_id)
    -- Propriétaire (Mes documents)
    AND (v_owner_id IS NULL OR d.auteur_id = v_owner_id)
    -- Profil collègue : publiés uniquement
    AND (v_profile_id IS NULL OR (d.auteur_id = v_profile_id AND d.is_published = TRUE))
    -- Brouillons inclus seulement si demandé explicitement ET que l'utilisateur est l'auteur.
    -- Sans owner_id ni include_drafts, on ne voit que les documents publiés (banque / profil).
    AND (
      v_include_drafts
      OR d.is_published = TRUE
      OR (v_owner_id IS NOT NULL AND d.auteur_id = v_owner_id)
    )
    -- Filtres multi-valeurs : overlap (&&)
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

COMMENT ON FUNCTION get_documents_enriched(jsonb) IS
  'Source de vérité unique des lectures documents pour la banque, Mes documents, profil collègue et lectures unitaires. Respecte les RLS via SECURITY INVOKER.';

REVOKE ALL ON FUNCTION get_documents_enriched(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_documents_enriched(jsonb) TO authenticated;
