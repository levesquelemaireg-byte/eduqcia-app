-- Migration : structures multi-éléments pour les documents historiques.
--
-- Ajoute le concept de « structure » (simple, perspectives, deux_temps) à la table
-- documents et crée la table document_elements pour stocker les éléments individuels
-- des documents multi-éléments.
--
-- Spec : docs/specs/document-renderer.md §3.3.
-- Les documents existants n'ont pas besoin de migration de données (données jetables).

-- ---------------------------------------------------------------------------
-- 1. Enum structure
-- ---------------------------------------------------------------------------

CREATE TYPE document_structure AS ENUM (
  'simple',
  'perspectives',
  'deux_temps'
);

-- ---------------------------------------------------------------------------
-- 2. Colonne structure sur documents
-- ---------------------------------------------------------------------------

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS structure document_structure NOT NULL DEFAULT 'simple';

COMMENT ON COLUMN documents.structure IS
  'Structure du document : simple (1 élément), perspectives (2-3 éléments), deux_temps (2 éléments). Défaut simple pour rétrocompatibilité.';

-- ---------------------------------------------------------------------------
-- 3. Table document_elements
-- ---------------------------------------------------------------------------

CREATE TABLE document_elements (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id        UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  position           SMALLINT NOT NULL DEFAULT 0,

  -- Type de contenu (discriminant)
  type               doc_type NOT NULL,

  -- Contenu textuel
  contenu            TEXT,

  -- Contenu iconographique
  image_url          TEXT,
  legende            TEXT,
  legende_position   document_legend_position,
  categorie_iconographique TEXT,

  -- Catégorie textuelle
  categorie_textuelle document_categorie_textuelle,

  -- Attribution contextuelle (selon la structure du document parent)
  auteur             TEXT,
  repere_temporel    TEXT,
  sous_titre         TEXT,

  -- Source bibliographique (par élément)
  source_citation    TEXT NOT NULL,
  source_type        document_source_type NOT NULL DEFAULT 'secondaire',

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE document_elements IS
  'Éléments individuels d''un document multi-éléments (perspectives, deux_temps). Pour un document simple, un seul élément. Ordonné par position.';

-- Index pour le chargement rapide des éléments d'un document
CREATE INDEX idx_document_elements_document_id ON document_elements (document_id, position);

-- ---------------------------------------------------------------------------
-- 4. RLS sur document_elements
-- ---------------------------------------------------------------------------

ALTER TABLE document_elements ENABLE ROW LEVEL SECURITY;

-- Lecture : même logique que documents (publié ou auteur)
CREATE POLICY "doc_elements_select"
  ON document_elements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_elements.document_id
        AND (d.is_published = TRUE OR d.auteur_id = auth.uid())
    )
  );

-- Écriture : auteur du document parent uniquement
CREATE POLICY "doc_elements_insert"
  ON document_elements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_elements.document_id
        AND d.auteur_id = auth.uid()
    )
  );

CREATE POLICY "doc_elements_update"
  ON document_elements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_elements.document_id
        AND d.auteur_id = auth.uid()
    )
  );

CREATE POLICY "doc_elements_delete"
  ON document_elements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_elements.document_id
        AND d.auteur_id = auth.uid()
    )
  );
