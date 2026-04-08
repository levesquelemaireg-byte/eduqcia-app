-- Migration : éclater tae_docs_write (FOR ALL) en INSERT/UPDATE/DELETE séparés
-- DELETE restreint à l'auteur de la TAÉ uniquement (DOMAIN §11.4 — collaborateur interdit)

DROP POLICY IF EXISTS "tae_docs_write" ON tae_documents;

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
