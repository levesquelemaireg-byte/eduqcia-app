-- Phase 1 Lot 4 — migration des slots documentaires doc_A..doc_D → doc_1..doc_4
--
-- Contexte : généralisation des slots documentaires pour supporter un nombre
-- variable de documents (1..N) au lieu du plafond câblé à 4 (A..D). La forme
-- alphabétique est conservée uniquement dans le `data-doc-ref` du HTML éditeur
-- (affichage lettre) ; tout placeholder `{{doc_*}}` publié passe au format
-- numérique `{{doc_N}}`.
--
-- Cette migration :
--   1. Migre les valeurs `slot` dans `tache_documents` (A→1, B→2, C→3, D→4).
--   2. Remplace la contrainte CHECK par une regex dynamique `^doc_[1-9][0-9]?$`.
--   3. Migre les placeholders `{{doc_A..D}}` dans `tache.consigne`, `tache.guidage`
--      et `tache.corrige` au format numérique (rétrocompat assurée à la lecture
--      côté applicatif, mais on convertit quand même pour cohérence future).
--
-- Les `data-doc-ref="A"` dans le HTML sont conservés tels quels (affichage).

-- ----------------------------------------------------------------------------
-- 1. Suppression de l'ancienne contrainte CHECK (elle bloquerait les UPDATE ci-dessous)
-- ----------------------------------------------------------------------------

ALTER TABLE tache_documents DROP CONSTRAINT IF EXISTS tae_documents_slot_check;
ALTER TABLE tache_documents DROP CONSTRAINT IF EXISTS tache_documents_slot_check;

-- ----------------------------------------------------------------------------
-- 2. Mise à jour des valeurs slot dans tache_documents
-- ----------------------------------------------------------------------------

UPDATE tache_documents SET slot = 'doc_1' WHERE slot = 'doc_A';
UPDATE tache_documents SET slot = 'doc_2' WHERE slot = 'doc_B';
UPDATE tache_documents SET slot = 'doc_3' WHERE slot = 'doc_C';
UPDATE tache_documents SET slot = 'doc_4' WHERE slot = 'doc_D';

-- ----------------------------------------------------------------------------
-- 3. Création de la nouvelle contrainte CHECK (regex dynamique)
-- ----------------------------------------------------------------------------

ALTER TABLE tache_documents
  ADD CONSTRAINT tache_documents_slot_check
  CHECK (slot ~ '^doc_[1-9][0-9]?$');

-- ----------------------------------------------------------------------------
-- 4. Migration des placeholders {{doc_A..D}} dans les colonnes HTML de `tache`
-- ----------------------------------------------------------------------------

UPDATE tache SET consigne = REPLACE(consigne, '{{doc_A}}', '{{doc_1}}') WHERE consigne LIKE '%{{doc_A}}%';
UPDATE tache SET consigne = REPLACE(consigne, '{{doc_B}}', '{{doc_2}}') WHERE consigne LIKE '%{{doc_B}}%';
UPDATE tache SET consigne = REPLACE(consigne, '{{doc_C}}', '{{doc_3}}') WHERE consigne LIKE '%{{doc_C}}%';
UPDATE tache SET consigne = REPLACE(consigne, '{{doc_D}}', '{{doc_4}}') WHERE consigne LIKE '%{{doc_D}}%';

UPDATE tache SET guidage = REPLACE(guidage, '{{doc_A}}', '{{doc_1}}') WHERE guidage LIKE '%{{doc_A}}%';
UPDATE tache SET guidage = REPLACE(guidage, '{{doc_B}}', '{{doc_2}}') WHERE guidage LIKE '%{{doc_B}}%';
UPDATE tache SET guidage = REPLACE(guidage, '{{doc_C}}', '{{doc_3}}') WHERE guidage LIKE '%{{doc_C}}%';
UPDATE tache SET guidage = REPLACE(guidage, '{{doc_D}}', '{{doc_4}}') WHERE guidage LIKE '%{{doc_D}}%';

UPDATE tache SET corrige = REPLACE(corrige, '{{doc_A}}', '{{doc_1}}') WHERE corrige LIKE '%{{doc_A}}%';
UPDATE tache SET corrige = REPLACE(corrige, '{{doc_B}}', '{{doc_2}}') WHERE corrige LIKE '%{{doc_B}}%';
UPDATE tache SET corrige = REPLACE(corrige, '{{doc_C}}', '{{doc_3}}') WHERE corrige LIKE '%{{doc_C}}%';
UPDATE tache SET corrige = REPLACE(corrige, '{{doc_D}}', '{{doc_4}}') WHERE corrige LIKE '%{{doc_D}}%';
