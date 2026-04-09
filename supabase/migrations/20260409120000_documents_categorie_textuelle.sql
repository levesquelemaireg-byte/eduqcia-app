-- Migration : ajouter la catégorie textuelle aux documents (Phase Chantier 3 — wizard catégories).
--
-- Symétrique à `type_iconographique` mais avec une contrainte ENUM stricte côté DB
-- (cf. décision D-Chantier3-DB Option B : 8 valeurs fixes basées sur la recherche didactique).
--
-- Source de vérité produit : public/data/document-categories.json (clé "textuelles").
-- Toute modification de cet enum doit être accompagnée d'une mise à jour du JSON
-- et inversement (test unitaire à ajouter ultérieurement).

-- ---------------------------------------------------------------------------
-- 1. Création du type ENUM
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 2. Ajout de la colonne (nullable — les documents iconographiques n'en ont pas)
-- ---------------------------------------------------------------------------

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS categorie_textuelle document_categorie_textuelle;

COMMENT ON COLUMN documents.categorie_textuelle IS
  'Catégorie didactique d''un document textuel (lois, écrits personnels, presse, etc.). NULL pour les documents iconographiques. Source produit : public/data/document-categories.json clé "textuelles".';

-- ---------------------------------------------------------------------------
-- 3. Index partiel pour les filtres banque par catégorie textuelle
--    (cohérent avec l'index existant idx_doc_type_iconographique)
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_doc_categorie_textuelle ON documents (categorie_textuelle)
  WHERE type = 'textuel'::doc_type AND categorie_textuelle IS NOT NULL;
