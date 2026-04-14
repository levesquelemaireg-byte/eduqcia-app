-- ============================================================
-- Tables de référence : CSS et écoles publiques secondaires
-- Source : données ouvertes MEQ (css-quebec.csv, ecoles-publiques-quebec.csv)
-- ============================================================

-- Type enum pour les catégories de CSS
CREATE TYPE css_type AS ENUM ('Franco', 'Anglo', 'Statut');

-- Centres de services scolaires
CREATE TABLE css (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gov_id       TEXT NOT NULL UNIQUE,      -- CD_ORGNS du MEQ (6 chiffres)
  nom_officiel TEXT NOT NULL,
  nom_court    TEXT NOT NULL,
  type_cs      css_type NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Écoles publiques secondaires
CREATE TABLE schools (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gov_id       TEXT NOT NULL UNIQUE,      -- CD_ORGNS du MEQ (6 chiffres)
  css_id       UUID NOT NULL REFERENCES css(id) ON DELETE RESTRICT,
  nom_officiel TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_css_gov_id        ON css (gov_id);
CREATE INDEX idx_css_active        ON css (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_schools_gov_id    ON schools (gov_id);
CREATE INDEX idx_schools_css_id    ON schools (css_id);
CREATE INDEX idx_schools_active    ON schools (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_schools_nom_trgm  ON schools USING GIN (nom_officiel gin_trgm_ops);
CREATE INDEX idx_css_nom_trgm      ON css USING GIN (nom_officiel gin_trgm_ops);

-- RLS
ALTER TABLE css     ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Lecture : tout utilisateur actif (même pattern que niveaux/disciplines)
CREATE POLICY "ref_select" ON css     FOR SELECT USING (auth_is_active());
CREATE POLICY "ref_select" ON schools FOR SELECT USING (auth_is_active());

-- Admin : CRUD complet
CREATE POLICY "ref_admin" ON css     FOR ALL USING (auth_role() = 'admin');
CREATE POLICY "ref_admin" ON schools FOR ALL USING (auth_role() = 'admin');

-- Triggers updated_at
CREATE TRIGGER trg_css_updated_at     BEFORE UPDATE ON css     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION set_updated_at();
