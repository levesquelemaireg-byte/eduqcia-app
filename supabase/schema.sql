-- ============================================================
-- SCHÉMA SUPABASE COMPLET — ÉduQc.IA
-- Source de vérité : DOMAIN.md (v1)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- TYPES ENUM
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'enseignant',
  'conseiller_pedagogique',
  'admin'
);

CREATE TYPE activation_status AS ENUM (
  'pending',
  'active',
  'suspended'
);

CREATE TYPE conception_mode AS ENUM (
  'seul',
  'equipe'
);

-- 5 aspects uniquement (DOMAIN §6.2 v1)
CREATE TYPE aspect_societe AS ENUM (
  'Économique',
  'Politique',
  'Social',
  'Culturel',
  'Territorial'
);

CREATE TYPE oi_status AS ENUM (
  'active',
  'coming_soon'
);

CREATE TYPE doc_type AS ENUM (
  'textuel',
  'iconographique'
);

CREATE TYPE document_structure AS ENUM (
  'simple',
  'perspectives',
  'deux_temps'
);

CREATE TYPE document_source_type AS ENUM (
  'primaire',
  'secondaire'
);

CREATE TYPE document_legend_position AS ENUM (
  'haut_gauche',
  'haut_droite',
  'bas_gauche',
  'bas_droite'
);

CREATE TYPE document_categorie_textuelle AS ENUM (
  'documents_officiels',
  'ecrits_personnels',
  'presse_publications',
  'discours_prises_parole',
  'textes_savants',
  'donnees_statistiques',
  'textes_litteraires_culturels',
  'autre'
);

CREATE TYPE vote_niveau AS ENUM ('1', '2', '3');

CREATE TYPE favori_type AS ENUM (
  'tae',
  'document',
  'evaluation'
);

CREATE TYPE version_trigger AS ENUM (
  'minor_patch',
  'major_bump'
);

CREATE TYPE css_type AS ENUM ('Franco', 'Anglo', 'Statut');

-- ============================================================
-- TABLES DE RÉFÉRENCE : CSS et écoles
-- ============================================================

CREATE TABLE css (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gov_id       TEXT NOT NULL UNIQUE,
  nom_officiel TEXT NOT NULL,
  nom_court    TEXT NOT NULL,
  type_cs      css_type NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schools (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gov_id       TEXT NOT NULL UNIQUE,
  css_id       UUID NOT NULL REFERENCES css(id) ON DELETE RESTRICT,
  nom_officiel TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_css_gov_id        ON css (gov_id);
CREATE INDEX idx_css_active        ON css (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_schools_gov_id    ON schools (gov_id);
CREATE INDEX idx_schools_css_id    ON schools (css_id);
CREATE INDEX idx_schools_active    ON schools (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_schools_nom_trgm  ON schools USING GIN (nom_officiel gin_trgm_ops);
CREATE INDEX idx_css_nom_trgm      ON css USING GIN (nom_officiel gin_trgm_ops);

ALTER TABLE css     ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ref_select" ON css     FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON schools FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_admin" ON css     FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin" ON schools FOR ALL USING (auth_role() = 'admin');

CREATE TRIGGER trg_css_updated_at     BEFORE UPDATE ON css     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE : profiles
-- ============================================================

CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT NOT NULL UNIQUE,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  role             user_role NOT NULL DEFAULT 'enseignant',
  status           activation_status NOT NULL DEFAULT 'pending',
  school_id        UUID REFERENCES schools(id) ON DELETE SET NULL,
  activation_token TEXT UNIQUE,
  activated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Pas de contrainte CHECK statique sur l'email :
  -- la validation domaine est gérée par le trigger trg_check_email_domain
  -- qui couvre à la fois @*.gouv.qc.ca et email_domains_whitelist
);

-- Liste blanche de domaines d'écoles (DOMAIN §11.1)
CREATE TABLE email_domains_whitelist (
  id         SERIAL PRIMARY KEY,
  domain     TEXT NOT NULL UNIQUE,  -- ex: 'cssmi.qc.ca'
  label      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger de validation email (gouv.qc.ca OU liste blanche)
CREATE OR REPLACE FUNCTION check_email_domain()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_domain TEXT := split_part(NEW.email, '@', 2);
BEGIN
  IF v_domain ~* '^([^.]+\.)*gouv\.qc\.ca$' THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM email_domains_whitelist WHERE domain = v_domain
  ) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Domaine email non autorisé : %', v_domain;
END;
$$;

CREATE TRIGGER trg_check_email_domain
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_email_domain();

-- ============================================================
-- TABLES DE RÉFÉRENCE
-- ============================================================

-- Niveaux scolaires — sec. 1 à 4 uniquement (DOMAIN §1)
CREATE TABLE niveaux (
  id     SERIAL PRIMARY KEY,
  code   TEXT NOT NULL UNIQUE,  -- 'sec1', 'sec2', 'sec3', 'sec4'
  label  TEXT NOT NULL,
  cycle  INT NOT NULL CHECK (cycle IN (1, 2)),
  ordre  INT NOT NULL
);

-- Disciplines (DOMAIN §6.1)
CREATE TABLE disciplines (
  id             SERIAL PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,  -- 'HEC', 'GEO', 'HQC'
  label          TEXT NOT NULL,
  cd_json_file   TEXT,   -- 'hec-cd.json' | 'hqc-cd.json' | null
  conn_json_file TEXT    -- 'hec-sec1-2.json' | 'hqc-sec3-4.json' | null
);

-- Opérations intellectuelles — 8 OI (DOMAIN §2)
CREATE TABLE oi (
  id     TEXT PRIMARY KEY,       -- 'OI0' à 'OI7'
  titre  TEXT NOT NULL,
  icone  TEXT,                   -- Material Symbols identifier
  status oi_status NOT NULL DEFAULT 'active',
  ordre  INT NOT NULL DEFAULT 0
);

-- Comportements attendus (DOMAIN §3.1)
CREATE TABLE comportements (
  id               TEXT PRIMARY KEY,   -- '0.1', '3.1', ..., '7.1'
  oi_id            TEXT NOT NULL REFERENCES oi(id) ON DELETE RESTRICT,
  enonce           TEXT NOT NULL,
  nb_documents     INT CHECK (nb_documents IS NULL OR nb_documents BETWEEN 1 AND 4),
  outil_evaluation TEXT NOT NULL,      -- ID du <template> HTML, ex: 'OI0_SO1'
  status           oi_status NOT NULL DEFAULT 'active',
  ordre            INT NOT NULL DEFAULT 0
);

-- Compétences disciplinaires — hiérarchie 3 niveaux (DOMAIN §6.3)
CREATE TABLE cd (
  id            SERIAL PRIMARY KEY,
  discipline_id INT NOT NULL REFERENCES disciplines(id) ON DELETE RESTRICT,
  competence    TEXT NOT NULL,   -- niveau 1
  composante    TEXT NOT NULL,   -- niveau 2
  critere       TEXT NOT NULL,   -- niveau 3
  code          TEXT,
  UNIQUE(discipline_id, competence, composante, critere)
);

-- Connaissances relatives (DOMAIN §6.4)
-- HEC : sous_section parfois NULL (3 ou 4 niveaux)
-- HQC : sous_section TOUJOURS NULL (toujours 3 niveaux)
CREATE TABLE connaissances (
  id              SERIAL PRIMARY KEY,
  discipline_id   INT NOT NULL REFERENCES disciplines(id) ON DELETE RESTRICT,
  realite_sociale TEXT NOT NULL,
  section         TEXT NOT NULL,
  sous_section    TEXT,   -- NULL pour HQC et parfois HEC — ne jamais supposer sa présence
  enonce          TEXT NOT NULL
);

-- ============================================================
-- TABLE : tae
-- Pas de colonne titre — on utilise consigne directement
-- ============================================================

CREATE TABLE tae (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auteur_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  conception_mode    conception_mode NOT NULL DEFAULT 'seul',

  -- CHAMPS MAJEURS (DOMAIN §9.2) — bump version + reset/archive votes
  oi_id              TEXT REFERENCES oi(id) ON DELETE RESTRICT,
  comportement_id    TEXT REFERENCES comportements(id) ON DELETE RESTRICT,
  cd_id              INT REFERENCES cd(id) ON DELETE SET NULL,
  connaissances_ids  INT[] NOT NULL DEFAULT '{}',

  -- CHAMPS MINEURS (DOMAIN §9.1) — patch silencieux, votes conservés
  consigne           TEXT,   -- sert aussi de titre partout (tronqué à 80 cars dans les vues)
  guidage            TEXT,   -- étayage optionnel, retiré pour éval sommative
  corrige            TEXT,   -- usage enseignant uniquement
  nb_lignes          INT,
  -- Parcours NR structurés (1.3+), nullable pour 1.1/1.2 legacy
  non_redaction_data JSONB,
  -- Recherche banque : texte sans balises HTML (généré) — docs/plan-banque-collaborative.md
  consigne_search_plain text GENERATED ALWAYS AS (
    trim(
      both ' ' FROM regexp_replace(
        regexp_replace(consigne, '<[^>]+>', ' ', 'g'),
        '[[:space:]]+',
        ' ',
        'g'
      )
    )
  ) STORED,

  -- Métadonnées d'indexation (DOMAIN §6)
  niveau_id          INT REFERENCES niveaux(id) ON DELETE SET NULL,
  discipline_id      INT REFERENCES disciplines(id) ON DELETE SET NULL,
  aspects_societe    aspect_societe[] NOT NULL DEFAULT '{}',

  -- Versioning
  version            INT NOT NULL DEFAULT 1,
  version_updated_at TIMESTAMPTZ,
  last_major_trigger TEXT,

  is_published       BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived        BOOLEAN NOT NULL DEFAULT FALSE,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collaborateurs d'une TAÉ (DOMAIN §11.4 — co-conception)
-- Collaborateur peut modifier, PAS supprimer
CREATE TABLE tae_collaborateurs (
  tae_id   UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (tae_id, user_id)
);

-- Brouillon wizard « Créer une TAÉ » — snapshot JSON du FormState (une ligne par utilisateur).
-- La ligne `tae` normalisée est réservée au flux publication / banque (SCHEMA.md).
CREATE TABLE tae_wizard_drafts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payload    JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX idx_tae_wizard_drafts_user ON tae_wizard_drafts (user_id);

-- Archive des versions majeures (DOMAIN §9.2)
CREATE TABLE tae_versions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tae_id            UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  version           INT NOT NULL,
  oi_id             TEXT,
  comportement_id   TEXT,
  cd_id             INT,
  connaissances_ids INT[] NOT NULL DEFAULT '{}',
  consigne          TEXT,
  guidage           TEXT,
  archived_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(tae_id, version)
);

-- ============================================================
-- TABLE : documents (historiques) — modèle source/instance (DOMAIN §5.3)
-- ============================================================

CREATE TABLE documents (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auteur_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  -- Modèle source/instance
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  source_version     INT,
  is_modified        BOOLEAN NOT NULL DEFAULT FALSE,

  titre              TEXT NOT NULL,
  type               doc_type NOT NULL,  -- raccourci du type du premier élément (filtres banque)
  structure          document_structure NOT NULL DEFAULT 'simple',
  elements           JSONB NOT NULL DEFAULT '[]',
  -- Facteur non destructif pour la taille des figures iconographiques sur la fiche imprimée (1,0 = défaut CSS).
  print_impression_scale numeric(3,2) NOT NULL DEFAULT 1.00
    CHECK (print_impression_scale >= 0.5 AND print_impression_scale <= 1.00),
  repere_temporel    TEXT,
  annee_normalisee   INT,

  -- Métadonnées héritées cumulativement depuis les TAÉ parentes (DOMAIN §8.8)
  -- Uniquement sur le master (source_document_id IS NULL)
  niveaux_ids        INT[] NOT NULL DEFAULT '{}',
  disciplines_ids    INT[] NOT NULL DEFAULT '{}',
  aspects_societe    aspect_societe[] NOT NULL DEFAULT '{}',
  connaissances_ids  INT[] NOT NULL DEFAULT '{}',

  version            INT NOT NULL DEFAULT 1,
  is_published       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN documents.print_impression_scale IS
  'Facteur d''échelle non destructif pour les figures iconographiques sur la fiche imprimée ; défaut 1,0 ; pas d''agrandissement au-delà du plafond CSS global.';
COMMENT ON COLUMN documents.structure IS
  'Structure du document : simple (1 élément), perspectives (2-3 éléments), deux_temps (2 éléments). Défaut simple pour rétrocompatibilité.';
COMMENT ON COLUMN documents.elements IS
  'Éléments du document en JSONB. 1 élément pour simple, 2–3 pour perspectives, 2 pour deux_temps. Chaque élément : { type, contenu?, image_url?, source_citation, source_type, categorie_textuelle?, categorie_iconographique?, image_legende?, image_legende_position?, auteur?, repere_temporel?, sous_titre? }.';
COMMENT ON COLUMN documents.repere_temporel IS
  'Repère temporel (texte libre). Saisie par l''enseignant ; non affiché sur la copie de l'élève.';
COMMENT ON COLUMN documents.annee_normalisee IS
  'Année normalisée (entier, peut être négatif). Comparaisons parcours non rédactionnels OI1.';

-- Liaison TAÉ ↔ Documents avec slots doc_A–D (DOMAIN §4.2 ; D = parcours non rédactionnel)
CREATE TABLE tae_documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tae_id      UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
  slot        TEXT NOT NULL CHECK (slot IN ('doc_A', 'doc_B', 'doc_C', 'doc_D')),
  ordre       INT NOT NULL DEFAULT 0,
  UNIQUE(tae_id, slot),
  UNIQUE(tae_id, document_id)
);

-- ============================================================
-- TABLE : votes (DOMAIN §8.3)
-- ============================================================

CREATE TABLE votes (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tae_id                 UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  tae_version            INT NOT NULL,
  votant_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rigueur_historique     vote_niveau NOT NULL,
  clarte_consigne        vote_niveau NOT NULL,
  alignement_ministeriel vote_niveau NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tae_id, votant_id, tae_version)
);

-- Votes archivés lors d'un bump majeur (DOMAIN §9.2)
CREATE TABLE votes_archives (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_vote_id       UUID NOT NULL,
  tae_id                 UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  tae_version            INT NOT NULL,
  votant_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rigueur_historique     vote_niveau NOT NULL,
  clarte_consigne        vote_niveau NOT NULL,
  alignement_ministeriel vote_niveau NOT NULL,
  voted_at               TIMESTAMPTZ NOT NULL,
  archived_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tracking des usages — déverrouille le droit de vote (DOMAIN §8.3 + §8.6)
CREATE TABLE tae_usages (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tae_id         UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pdf_downloaded BOOLEAN NOT NULL DEFAULT FALSE,
  added_to_eval  BOOLEAN NOT NULL DEFAULT FALSE,
  favorited      BOOLEAN NOT NULL DEFAULT FALSE,
  first_usage_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tae_id, user_id)
);

-- ============================================================
-- TABLE : commentaires (DOMAIN §8.4)
-- ============================================================

CREATE TABLE commentaires (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tae_id     UUID NOT NULL REFERENCES tae(id) ON DELETE CASCADE,
  auteur_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  contenu    TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : evaluations (DOMAIN §10)
-- titre présent — une évaluation a un vrai titre distinct de son contenu
-- ============================================================

CREATE TABLE evaluations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auteur_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  titre        TEXT NOT NULL,
  description  TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TAÉ dans une évaluation — ordre drag-and-drop (DOMAIN §10.2)
CREATE TABLE evaluation_tae (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  tae_id        UUID NOT NULL REFERENCES tae(id) ON DELETE RESTRICT,
  ordre         INT NOT NULL DEFAULT 0,
  UNIQUE(evaluation_id, tae_id)
);

-- ============================================================
-- TABLE : favoris (DOMAIN §8.6)
-- ============================================================

CREATE TABLE favoris (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       favori_type NOT NULL,
  item_id    UUID NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type, item_id)
);

-- ============================================================
-- TABLE : notifications (DOMAIN §8.5)
-- ============================================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,   -- 'tae_modified' | 'tae_commented' | 'doc_updated'
  payload    JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO niveaux (code, label, cycle, ordre) VALUES
  ('sec1', 'Secondaire 1', 1, 1),
  ('sec2', 'Secondaire 2', 1, 2),
  ('sec3', 'Secondaire 3', 2, 3),
  ('sec4', 'Secondaire 4', 2, 4);

INSERT INTO disciplines (code, label, cd_json_file, conn_json_file) VALUES
  ('HEC', 'Histoire et éducation à la citoyenneté',   'hec-cd.json', 'hec-sec1-2.json'),
  ('GEO', 'Géographie et éducation à la citoyenneté',  NULL,          NULL),
  ('HQC', 'Histoire du Québec et du Canada',           'hqc-cd.json', 'hqc-sec3-4.json');

-- OI0 active — FEATURES.md §2 + public/data/oi.json (comportement 0.1, 1 document)
-- Icônes = public/data/oi.json (Material Symbols — pas « link » pour OI7 : liste / enchaînement)
INSERT INTO oi (id, titre, icone, status, ordre) VALUES
  ('OI0', 'Établir des faits',                             'document_search', 'active',      0),
  ('OI1', 'Situer dans le temps',                          'hourglass',       'active',      1),
  ('OI2', 'Situer dans l''espace',                         'map_search',      'coming_soon', 2),
  ('OI3', 'Dégager des différences et des similitudes',    'text_compare',    'active',      3),
  ('OI4', 'Déterminer des causes et des conséquences',     'manufacturing',   'active',      4),
  ('OI5', 'Mettre en relation des faits',                  'graph_3',         'coming_soon', 5),
  ('OI6', 'Déterminer des changements et des continuités', 'alt_route',       'active',      6),
  ('OI7', 'Établir des liens de causalité',                'list',            'active',      7);

-- 17 comportements : 0.1 actif ; OI1 : 1.1–1.3 (non rédactionnel, nb_documents aligné oi.json) ; 4.3 et 4.4 coming_soon
INSERT INTO comportements (id, oi_id, enonce, nb_documents, outil_evaluation, status, ordre) VALUES
  ('0.1', 'OI0', 'Établir un fait à partir d''un document historique',                                                                                        1, 'OI0_SO1', 'active',      0),
  ('1.1', 'OI1', 'Ordonner chronologiquement des faits en tenant compte de repères de temps',                                                                   4, 'OI1_SO1', 'active',      0),
  ('1.2', 'OI1', 'Situer des faits sur une ligne du temps',                                                                                                     1, 'OI1_SO2', 'active',      1),
  ('1.3', 'OI1', 'Classer des faits selon qu''ils sont antérieurs ou postérieurs à un repère de temps',                                                         4, 'OI1_SO3', 'active',      2),
  ('3.1', 'OI3', 'Indiquer ce qui est différent par rapport à un ou plusieurs objets de comparaison',                                                          1, 'OI3_SO1', 'active',      0),
  ('3.2', 'OI3', 'Indiquer ce qui est semblable par rapport à un ou plusieurs objets de comparaison',                                                          1, 'OI3_SO2', 'active',      1),
  ('3.3', 'OI3', 'Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (divergence)',                                            2, 'OI3_SO3', 'active',      2),
  ('3.4', 'OI3', 'Indiquer le point précis sur lequel des acteurs ou des historiens sont d''accord (convergence)',                                              2, 'OI3_SO4', 'active',      3),
  ('3.5', 'OI3', 'Montrer des différences et des similitudes par rapport à des points de vue d''acteurs ou à des interprétations d''historiens',               3, 'OI3_SO5', 'active',      4),
  ('4.1', 'OI4', 'Indiquer un facteur explicatif, c.-à-d. un fait qui explique une réalité historique (réponse écrite)',                                        1, 'OI4_SO1', 'active',      0),
  ('4.2', 'OI4', 'Indiquer un fait qui découle d''une réalité historique (réponse écrite)',                                                                    1, 'OI4_SO2', 'active',      1),
  ('4.3', 'OI4', 'Deux facteurs explicatifs (réponse = numéros de documents)',                                                                                 2, 'OI4_SO3', 'coming_soon', 2),
  ('4.4', 'OI4', 'Facteur et conséquence (réponse = numéros de documents)',                                                                                    2, 'OI4_SO4', 'coming_soon', 3),
  ('6.1', 'OI6', 'Indiquer un fait qui montre qu''une réalité historique se transforme',                                                                       2, 'OI6_SO1', 'active',      0),
  ('6.2', 'OI6', 'Indiquer un fait qui montre qu''une réalité historique se maintient',                                                                        2, 'OI6_SO2', 'active',      1),
  ('6.3', 'OI6', 'Montrer qu''une réalité historique se transforme ou se maintient',                                                                           3, 'OI6_SO3', 'active',      2),
  ('7.1', 'OI7', 'Exprimer un enchaînement logique qui existe entre des faits',                                                                                3, 'OI7_SO1', 'active',      0);

-- ============================================================
-- INDEXES
-- ============================================================

-- Recherche textuelle (banque — DOMAIN §8.2, §8.7)
-- tae : consigne uniquement (pas de titre)
CREATE INDEX idx_tae_consigne_search_trgm ON tae USING GIN (consigne_search_plain gin_trgm_ops);
CREATE INDEX idx_doc_titre_trgm       ON documents USING GIN (titre gin_trgm_ops);
CREATE INDEX idx_doc_contenu_trgm     ON documents USING GIN (contenu gin_trgm_ops);
CREATE INDEX idx_doc_source_trgm      ON documents USING GIN (source_citation gin_trgm_ops);
CREATE INDEX idx_comm_contenu_trgm    ON commentaires USING GIN (contenu gin_trgm_ops);

-- Filtres banque TAÉ (DOMAIN §8.2)
CREATE INDEX idx_tae_oi               ON tae (oi_id);
CREATE INDEX idx_tae_comportement     ON tae (comportement_id);
CREATE INDEX idx_tae_niveau           ON tae (niveau_id);
CREATE INDEX idx_tae_discipline       ON tae (discipline_id);
CREATE INDEX idx_tae_aspects          ON tae USING GIN (aspects_societe);
CREATE INDEX idx_tae_connaissances    ON tae USING GIN (connaissances_ids);
CREATE INDEX idx_tae_auteur           ON tae (auteur_id);
CREATE INDEX idx_tae_published        ON tae (is_published) WHERE is_published = TRUE;
CREATE INDEX idx_tae_active           ON tae (is_archived)  WHERE is_archived  = FALSE;
CREATE INDEX idx_tae_version          ON tae (id, version);

-- Filtres banque documents (DOMAIN §8.7)
CREATE INDEX idx_doc_type             ON documents (type);
CREATE INDEX idx_doc_type_iconographique ON documents (type_iconographique)
  WHERE type = 'iconographique'::doc_type AND type_iconographique IS NOT NULL;
CREATE INDEX idx_doc_categorie_textuelle ON documents (categorie_textuelle)
  WHERE type = 'textuel'::doc_type AND categorie_textuelle IS NOT NULL;
CREATE INDEX idx_doc_niveaux          ON documents USING GIN (niveaux_ids);
CREATE INDEX idx_doc_disciplines      ON documents USING GIN (disciplines_ids);
CREATE INDEX idx_doc_aspects          ON documents USING GIN (aspects_societe);
CREATE INDEX idx_doc_connaissances    ON documents USING GIN (connaissances_ids);
CREATE INDEX idx_doc_auteur           ON documents (auteur_id);
CREATE INDEX idx_doc_source_ref       ON documents (source_document_id) WHERE source_document_id IS NOT NULL;
CREATE INDEX idx_doc_published        ON documents (is_published) WHERE is_published = TRUE;
CREATE INDEX idx_doc_source_type      ON documents (source_type);

-- Votes
CREATE INDEX idx_votes_tae            ON votes (tae_id);
CREATE INDEX idx_votes_votant         ON votes (votant_id);
CREATE INDEX idx_votes_tae_version    ON votes (tae_id, tae_version);
CREATE INDEX idx_votes_arch_tae       ON votes_archives (tae_id);

-- Usages
CREATE INDEX idx_usages_tae_user      ON tae_usages (tae_id, user_id);
CREATE INDEX idx_usages_user          ON tae_usages (user_id);

-- Évaluations
CREATE INDEX idx_eval_auteur          ON evaluations (auteur_id);
CREATE INDEX idx_eval_tae_ordre       ON evaluation_tae (evaluation_id, ordre);
CREATE INDEX idx_eval_tae_ref         ON evaluation_tae (tae_id);

-- Favoris
CREATE INDEX idx_favoris_user         ON favoris (user_id);
CREATE INDEX idx_favoris_item         ON favoris (type, item_id);

-- Notifications
CREATE INDEX idx_notif_user_unread    ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notif_created        ON notifications (created_at DESC);

-- Collaborateurs
CREATE INDEX idx_collab_user          ON tae_collaborateurs (user_id);
CREATE INDEX idx_collab_tae           ON tae_collaborateurs (tae_id);

-- Profils
CREATE INDEX idx_profiles_token       ON profiles (activation_token) WHERE activation_token IS NOT NULL;
CREATE INDEX idx_profiles_status      ON profiles (status);
CREATE INDEX idx_profiles_role        ON profiles (role);
CREATE INDEX idx_profiles_school_id   ON profiles (school_id);
CREATE INDEX idx_profiles_last_name   ON profiles (last_name);

-- Commentaires
CREATE INDEX idx_comm_tae             ON commentaires (tae_id, created_at DESC);
CREATE INDEX idx_comm_auteur          ON commentaires (auteur_id);

-- tae_documents
CREATE INDEX idx_tae_docs_tae         ON tae_documents (tae_id, ordre);
CREATE INDEX idx_tae_docs_document    ON tae_documents (document_id);

-- CD et connaissances
CREATE INDEX idx_cd_discipline        ON cd (discipline_id);
CREATE INDEX idx_conn_discipline      ON connaissances (discipline_id);
CREATE INDEX idx_conn_realite         ON connaissances (realite_sociale);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_domains_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveaux                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines             ENABLE ROW LEVEL SECURITY;
ALTER TABLE oi                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE comportements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cd                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE connaissances           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tae                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tae_wizard_drafts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tae_collaborateurs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tae_versions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tae_documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes_archives          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tae_usages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires            ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_tae          ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Fonctions helper (SECURITY DEFINER — évite la récursion RLS)
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid() AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION auth_is_active()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'active');
$$;

-- Évite la récursion RLS (tae ↔ tae_collaborateurs ↔ tae) lors des sous-requêtes dans les politiques.
CREATE OR REPLACE FUNCTION auth_can_edit_tae(p_tae_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1 FROM tae WHERE id = p_tae_id AND auteur_id = auth.uid()
    UNION ALL
    SELECT 1 FROM tae_collaborateurs WHERE tae_id = p_tae_id AND user_id = auth.uid()
  );
END;
$$;

-- Même principe : lecture des liaisons tae_documents sans réentrer dans tae_select / collab_manage en boucle.
CREATE OR REPLACE FUNCTION tae_user_can_access_for_document_link(p_tae_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1 FROM tae t
    WHERE t.id = p_tae_id
      AND (
        t.is_published
        OR t.auteur_id = auth.uid()
        OR auth_role() IN ('admin', 'conseiller_pedagogique')
        OR EXISTS (
          SELECT 1 FROM tae_collaborateurs tc
          WHERE tc.tae_id = p_tae_id AND tc.user_id = auth.uid()
        )
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth_can_vote(p_tae_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN (
    EXISTS (
      SELECT 1 FROM tae_usages
      WHERE tae_id = p_tae_id
        AND user_id = auth.uid()
        AND (pdf_downloaded OR added_to_eval OR favorited)
    )
    AND NOT EXISTS (
      SELECT 1 FROM tae WHERE id = p_tae_id AND auteur_id = auth.uid()
    )
  );
END;
$$;

-- -------------------------------------------------------
-- RLS : profiles
-- -------------------------------------------------------

CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  USING (auth_is_active());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role   = (SELECT role   FROM profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_admin"
  ON profiles FOR ALL
  USING (auth_role() = 'admin');

-- -------------------------------------------------------
-- RLS : tables de référence
-- -------------------------------------------------------

CREATE POLICY "ref_select" ON niveaux                 FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON disciplines             FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON oi                      FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON comportements           FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON cd                      FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON connaissances           FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON email_domains_whitelist FOR SELECT USING (auth_is_active());

CREATE POLICY "ref_admin"  ON niveaux                 FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin"  ON disciplines             FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin"  ON oi                      FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin"  ON comportements           FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin"  ON cd                      FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin"  ON connaissances           FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin"  ON email_domains_whitelist FOR ALL USING (auth_role() = 'admin');

-- -------------------------------------------------------
-- RLS : tae
-- -------------------------------------------------------

-- Lecture sans auth_can_edit_tae() : un SELECT sur tae dans une fonction STABLE
-- invoquée depuis USING peut réactiver tae_select → 42P17 récursion infinie.
DROP POLICY IF EXISTS "tae_select" ON tae;

CREATE POLICY "tae_select"
  ON tae FOR SELECT
  USING (
    auth_is_active()
    AND (
      is_published = TRUE
      OR auteur_id = auth.uid()
      OR auth_role() IN ('admin', 'conseiller_pedagogique')
      OR EXISTS (
        SELECT 1 FROM tae_collaborateurs tc
        WHERE tc.tae_id = tae.id
          AND tc.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "tae_insert"
  ON tae FOR INSERT
  WITH CHECK (auth_is_active() AND auteur_id = auth.uid());

CREATE POLICY "tae_update"
  ON tae FOR UPDATE
  USING (auth_can_edit_tae(id) OR auth_role() IN ('admin', 'conseiller_pedagogique'));

-- Auteur seulement peut supprimer (DOMAIN §11.4 — collaborateur interdit)
CREATE POLICY "tae_delete"
  ON tae FOR DELETE
  USING (auteur_id = auth.uid() OR auth_role() = 'admin');

-- -------------------------------------------------------
-- RLS : tae_wizard_drafts (brouillon création — utilisateur connecté uniquement)
-- -------------------------------------------------------

CREATE POLICY "tae_wizard_drafts_select_own"
  ON tae_wizard_drafts FOR SELECT
  USING (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "tae_wizard_drafts_insert_own"
  ON tae_wizard_drafts FOR INSERT
  WITH CHECK (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "tae_wizard_drafts_update_own"
  ON tae_wizard_drafts FOR UPDATE
  USING (auth_is_active() AND user_id = auth.uid())
  WITH CHECK (auth_is_active() AND user_id = auth.uid());

CREATE POLICY "tae_wizard_drafts_delete_own"
  ON tae_wizard_drafts FOR DELETE
  USING (auth_is_active() AND user_id = auth.uid());

-- -------------------------------------------------------
-- RLS : tae_collaborateurs
-- -------------------------------------------------------

CREATE POLICY "collab_select"
  ON tae_collaborateurs FOR SELECT
  USING (auth_is_active());

-- FOR ALL + SELECT réévaluait EXISTS (… FROM tae …) pendant le sous-SELECT sur
-- tae_collaborateurs dans tae_select → 42P17. Réservé aux écritures.
DROP POLICY IF EXISTS "collab_manage" ON tae_collaborateurs;

CREATE POLICY "collab_manage_insert"
  ON tae_collaborateurs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

CREATE POLICY "collab_manage_update"
  ON tae_collaborateurs FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

CREATE POLICY "collab_manage_delete"
  ON tae_collaborateurs FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

-- -------------------------------------------------------
-- RLS : tae_versions
-- -------------------------------------------------------

CREATE POLICY "tae_versions_select"
  ON tae_versions FOR SELECT
  USING (
    auth_is_active()
    AND (
      EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
      OR auth_role() IN ('admin', 'conseiller_pedagogique')
    )
  );

-- -------------------------------------------------------
-- RLS : tae_documents
-- -------------------------------------------------------

DROP POLICY IF EXISTS "tae_docs_select" ON tae_documents;
CREATE POLICY "tae_docs_select"
  ON tae_documents FOR SELECT
  USING (
    auth_is_active()
    AND tae_user_can_access_for_document_link(tae_id)
  );

CREATE POLICY "tae_docs_insert"
  ON tae_documents FOR INSERT
  WITH CHECK (auth_can_edit_tae(tae_id) OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "tae_docs_update"
  ON tae_documents FOR UPDATE
  USING (auth_can_edit_tae(tae_id) OR auth_role() IN ('admin', 'conseiller_pedagogique'));

-- DELETE : auteur uniquement — DOMAIN §11.4 (collaborateur interdit)
CREATE POLICY "tae_docs_delete"
  ON tae_documents FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
    OR auth_role() = 'admin'
  );

-- -------------------------------------------------------
-- RLS : documents
-- -------------------------------------------------------

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

-- -------------------------------------------------------
-- RLS : votes
-- -------------------------------------------------------

-- Nombres bruts publics (DOMAIN §8.3 — pas de moyenne)
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

-- -------------------------------------------------------
-- RLS : votes_archives
-- -------------------------------------------------------

-- Auteur de la TAÉ + admin + CP (dashboard privé DOMAIN §8.3)
CREATE POLICY "votes_arch_select"
  ON votes_archives FOR SELECT
  USING (
    votant_id = auth.uid()
    OR auth_role() IN ('admin', 'conseiller_pedagogique')
    OR EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND auteur_id = auth.uid())
  );

-- -------------------------------------------------------
-- RLS : tae_usages
-- -------------------------------------------------------

CREATE POLICY "usages_select"
  ON tae_usages FOR SELECT
  USING (user_id = auth.uid() OR auth_role() IN ('admin', 'conseiller_pedagogique'));

CREATE POLICY "usages_write"
  ON tae_usages FOR ALL
  USING  (user_id = auth.uid() OR auth_role() = 'admin')
  WITH CHECK (user_id = auth.uid() OR auth_role() = 'admin');

-- -------------------------------------------------------
-- RLS : commentaires (DOMAIN §8.4 — publics sur TAÉ publiées)
-- -------------------------------------------------------

CREATE POLICY "comm_select"
  ON commentaires FOR SELECT
  USING (
    auth_is_active()
    AND is_deleted = FALSE
    AND EXISTS (SELECT 1 FROM tae WHERE id = tae_id AND is_published = TRUE)
  );

CREATE POLICY "comm_insert"
  ON commentaires FOR INSERT
  WITH CHECK (auth_is_active() AND auteur_id = auth.uid());

CREATE POLICY "comm_update"
  ON commentaires FOR UPDATE
  USING (auteur_id = auth.uid() OR auth_role() = 'admin');

-- -------------------------------------------------------
-- RLS : evaluations
-- -------------------------------------------------------

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

-- -------------------------------------------------------
-- RLS : evaluation_tae
-- -------------------------------------------------------

CREATE POLICY "eval_tae_select"
  ON evaluation_tae FOR SELECT
  USING (
    auth_is_active()
    AND EXISTS (
      SELECT 1 FROM evaluations e WHERE e.id = evaluation_id
        AND (e.is_published OR e.auteur_id = auth.uid()
             OR auth_role() IN ('admin', 'conseiller_pedagogique'))
    )
  );

CREATE POLICY "eval_tae_write"
  ON evaluation_tae FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = evaluation_id AND e.auteur_id = auth.uid()
    )
    OR auth_role() = 'admin'
  );

-- -------------------------------------------------------
-- RLS : favoris (strictement privés)
-- -------------------------------------------------------

CREATE POLICY "favoris_own"
  ON favoris FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "favoris_admin_select"
  ON favoris FOR SELECT
  USING (auth_role() = 'admin');

-- -------------------------------------------------------
-- RLS : notifications (privées)
-- -------------------------------------------------------

CREATE POLICY "notif_own"
  ON notifications FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notif_admin"
  ON notifications FOR ALL
  USING (auth_role() = 'admin');

-- ============================================================
-- FONCTIONS MÉTIER
-- ============================================================

-- -----------------------------------------------------------
-- bump_tae_version (DOMAIN §9.2)
-- À appeler côté serveur AVANT d'écrire les nouveaux champs majeurs
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION bump_tae_version(
  p_tae_id        UUID,
  p_trigger_field TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  t tae%ROWTYPE;
BEGIN
  SELECT * INTO t FROM tae WHERE id = p_tae_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'TAÉ introuvable : %', p_tae_id; END IF;

  -- 1. Archiver la version courante
  INSERT INTO tae_versions (
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
  UPDATE tae SET
    version             = version + 1,
    version_updated_at  = NOW(),
    last_major_trigger  = p_trigger_field,
    updated_at          = NOW()
  WHERE id = p_tae_id;
END;
$$;

-- -----------------------------------------------------------
-- inherit_metadata_to_source_doc (DOMAIN §8.8)
-- Fusion cumulative — uniquement sur le master
-- Appeler pour chaque document source lié à la TAÉ à la publication
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION inherit_metadata_to_source_doc(
  p_document_id UUID,
  p_tae_id      UUID
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  t tae%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM documents
    WHERE id = p_document_id AND source_document_id IS NULL
  ) THEN RETURN; END IF;

  SELECT * INTO t FROM tae WHERE id = p_tae_id;

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

-- -----------------------------------------------------------
-- record_tae_usage (DOMAIN §8.3 + §8.6)
-- Déverrouille le droit de vote (OR cumulatif — jamais de régression)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION record_tae_usage(
  p_tae_id         UUID,
  p_pdf_downloaded BOOLEAN DEFAULT FALSE,
  p_added_to_eval  BOOLEAN DEFAULT FALSE,
  p_favorited      BOOLEAN DEFAULT FALSE
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO tae_usages (tae_id, user_id, pdf_downloaded, added_to_eval, favorited)
  VALUES (p_tae_id, auth.uid(), p_pdf_downloaded, p_added_to_eval, p_favorited)
  ON CONFLICT (tae_id, user_id) DO UPDATE SET
    pdf_downloaded = tae_usages.pdf_downloaded OR EXCLUDED.pdf_downloaded,
    added_to_eval  = tae_usages.added_to_eval  OR EXCLUDED.added_to_eval,
    favorited      = tae_usages.favorited      OR EXCLUDED.favorited,
    updated_at     = NOW();
END;
$$;

-- -----------------------------------------------------------
-- get_field_version_type (DOMAIN §9.1)
-- Principe de précaution : tout champ inconnu = majeur
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION get_field_version_type(field_name TEXT)
RETURNS version_trigger LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF field_name IN ('consigne', 'guidage', 'corrige', 'nb_lignes') THEN
    RETURN 'minor_patch';
  ELSE
    RETURN 'major_bump';
  END IF;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tae_updated_at          BEFORE UPDATE ON tae          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at    BEFORE UPDATE ON documents    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_votes_updated_at        BEFORE UPDATE ON votes        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_evaluations_updated_at  BEFORE UPDATE ON evaluations  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_commentaires_updated_at BEFORE UPDATE ON commentaires FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tae_usages_updated_at   BEFORE UPDATE ON tae_usages   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Favori TAÉ = usage → déverrouille le vote (DOMAIN §8.6)
CREATE OR REPLACE FUNCTION sync_usage_on_favori()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.type = 'tae' THEN
    PERFORM record_tae_usage(NEW.item_id, FALSE, FALSE, TRUE);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_favori_sync_usage
  AFTER INSERT ON favoris
  FOR EACH ROW EXECUTE FUNCTION sync_usage_on_favori();

-- ============================================================
-- VUES
-- ============================================================

-- Nombres bruts — affichage PUBLIC (DOMAIN §8.3 — pas de moyenne)
CREATE OR REPLACE VIEW vote_counts AS
SELECT
  tae_id,
  tae_version,
  COUNT(*) FILTER (WHERE rigueur_historique     = '1') AS rigueur_n1,
  COUNT(*) FILTER (WHERE rigueur_historique     = '2') AS rigueur_n2,
  COUNT(*) FILTER (WHERE rigueur_historique     = '3') AS rigueur_n3,
  COUNT(*) FILTER (WHERE clarte_consigne        = '1') AS clarte_n1,
  COUNT(*) FILTER (WHERE clarte_consigne        = '2') AS clarte_n2,
  COUNT(*) FILTER (WHERE clarte_consigne        = '3') AS clarte_n3,
  COUNT(*) FILTER (WHERE alignement_ministeriel = '1') AS alignement_n1,
  COUNT(*) FILTER (WHERE alignement_ministeriel = '2') AS alignement_n2,
  COUNT(*) FILTER (WHERE alignement_ministeriel = '3') AS alignement_n3,
  COUNT(*)                                             AS total_votants
FROM votes
GROUP BY tae_id, tae_version;

-- Moyennes — dashboard privé auteur UNIQUEMENT (DOMAIN §8.3 exception)
-- Filtrer côté Next.js Route Handler : WHERE auteur_id = auth.uid()
CREATE OR REPLACE VIEW vote_stats_author AS
SELECT
  v.tae_id,
  v.tae_version,
  t.auteur_id,
  COUNT(*) FILTER (WHERE v.rigueur_historique     = '1') AS rigueur_n1,
  COUNT(*) FILTER (WHERE v.rigueur_historique     = '2') AS rigueur_n2,
  COUNT(*) FILTER (WHERE v.rigueur_historique     = '3') AS rigueur_n3,
  COUNT(*) FILTER (WHERE v.clarte_consigne        = '1') AS clarte_n1,
  COUNT(*) FILTER (WHERE v.clarte_consigne        = '2') AS clarte_n2,
  COUNT(*) FILTER (WHERE v.clarte_consigne        = '3') AS clarte_n3,
  COUNT(*) FILTER (WHERE v.alignement_ministeriel = '1') AS alignement_n1,
  COUNT(*) FILTER (WHERE v.alignement_ministeriel = '2') AS alignement_n2,
  COUNT(*) FILTER (WHERE v.alignement_ministeriel = '3') AS alignement_n3,
  ROUND(AVG(v.rigueur_historique::TEXT::INT),     2) AS rigueur_avg,
  ROUND(AVG(v.clarte_consigne::TEXT::INT),        2) AS clarte_avg,
  ROUND(AVG(v.alignement_ministeriel::TEXT::INT), 2) AS alignement_avg,
  COUNT(*) AS total_votants
FROM votes v
JOIN tae t ON t.id = v.tae_id
GROUP BY v.tae_id, v.tae_version, t.auteur_id;

-- Banque TAÉ publiées
-- apercu = consigne tronquée à 80 caractères (pas de colonne titre sur tae)
-- security_invoker (PG15+) : RLS / droits du **requérant**, pas du propriétaire de la vue (évite l’alerte Supabase « SECURITY DEFINER » sur les vues).
CREATE OR REPLACE VIEW banque_tae
WITH (security_invoker = true)
AS
SELECT
  t.id,
  t.auteur_id,
  p.first_name || ' ' || p.last_name AS auteur_nom,
  s.nom_officiel                     AS auteur_ecole,
  cs.nom_officiel                    AS auteur_css,
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
LEFT JOIN schools s       ON s.id  = p.school_id
LEFT JOIN css cs          ON cs.id = s.css_id
LEFT JOIN oi              ON oi.id = t.oi_id
LEFT JOIN comportements c ON c.id  = t.comportement_id
LEFT JOIN niveaux n       ON n.id  = t.niveau_id
LEFT JOIN disciplines d   ON d.id  = t.discipline_id
LEFT JOIN vote_counts vc  ON vc.tae_id = t.id AND vc.tae_version = t.version
WHERE t.is_published = TRUE
  AND t.is_archived  = FALSE;

-- ============================================================
-- Collaborateurs TAÉ (payload JSON `collaborateurs_user_ids` — UUID profils actifs)
-- Appelée depuis les RPC publish / update (SECURITY DEFINER, RLS off dans le parent).
-- ============================================================

CREATE OR REPLACE FUNCTION apply_tae_collaborateurs_from_payload(
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
    DELETE FROM tae_collaborateurs WHERE tae_id = p_tae_id;
  END IF;

  IF (p_payload->'tae'->>'conception_mode') IS DISTINCT FROM 'equipe' THEN
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
      INSERT INTO tae_collaborateurs (tae_id, user_id, added_by)
      VALUES (p_tae_id, v_uid, p_auteur)
      ON CONFLICT (tae_id, user_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- RPC : publication TAÉ (transaction atomique)
-- Appelée depuis Next.js : supabase.rpc('publish_tae_transaction', { p_payload: <objet> })
-- Voir docs/SCHEMA.md — « Fonction RPC : publish_tae_transaction ».
-- ============================================================

CREATE OR REPLACE FUNCTION publish_tae_transaction(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
-- SECURITY DEFINER + désactivation RLS dans le corps : évite la récursion infinie entre
-- tae_docs_write → auth_can_edit_tae() → SELECT sur tae → tae_select / collaborateurs.
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
    RAISE EXCEPTION 'publish_tae_transaction: auteur_id invalide';
  END IF;

  IF NOT (p_payload ? 'tae' AND p_payload ? 'documents_new' AND p_payload ? 'slots') THEN
    RAISE EXCEPTION 'publish_tae_transaction: payload incomplet';
  END IF;

  -- Réservé au rôle propriétaire de la fonction (postgres) : contourne RLS pour cette transaction locale uniquement.
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

  -- Brouillon wizard : si la table n’est pas encore migrée sur le projet Supabase, ne pas faire échouer la publication.
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

GRANT EXECUTE ON FUNCTION publish_tae_transaction(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION publish_tae_transaction(jsonb) TO service_role;

-- ============================================================
-- RPC : mise à jour TAÉ (même forme de payload que publish_tae_transaction)
-- ============================================================

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

GRANT EXECUTE ON FUNCTION update_tae_transaction(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tae_transaction(uuid, jsonb) TO service_role;

-- ============================================================
-- RPC : composition d’épreuve (brouillon / publication) — table `evaluations`
-- ============================================================

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

GRANT EXECUTE ON FUNCTION tae_user_can_access_for_document_link(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION tae_user_can_access_for_document_link(UUID) TO service_role;

-- ============================================================
-- STORAGE : images des documents iconographiques (wizard → publication)
-- Bucket public pour URL https dans `documents.image_url`.
-- À appliquer sur le projet Supabase (SQL ou Dashboard) si absent.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tae-document-images',
  'tae-document-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "tae_doc_img_insert_own" ON storage.objects;
CREATE POLICY "tae_doc_img_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tae-document-images'
    AND name LIKE (auth.uid()::text || '/%')
  );

DROP POLICY IF EXISTS "tae_doc_img_select_public" ON storage.objects;
CREATE POLICY "tae_doc_img_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'tae-document-images');

DROP POLICY IF EXISTS "tae_doc_img_delete_own" ON storage.objects;
CREATE POLICY "tae_doc_img_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'tae-document-images'
    AND name LIKE (auth.uid()::text || '/%')
  );
