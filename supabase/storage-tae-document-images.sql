-- Exécuter dans Supabase → SQL (une fois par projet).
-- Bucket public + RLS : upload dans {auth.uid()}/*, lecture pour tous.

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
