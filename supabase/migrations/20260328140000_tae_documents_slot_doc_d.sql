-- Quatrième slot documentaire TAÉ (parcours non rédactionnel, ex. 4 documents — spec ordre chronologique).
-- Remplace la contrainte CHECK sur `tae_documents.slot` (PostgreSQL nomme souvent `tae_documents_slot_check`).

ALTER TABLE tae_documents
  DROP CONSTRAINT IF EXISTS tae_documents_slot_check;

ALTER TABLE tae_documents
  ADD CONSTRAINT tae_documents_slot_check
  CHECK (slot IN ('doc_A', 'doc_B', 'doc_C', 'doc_D'));
