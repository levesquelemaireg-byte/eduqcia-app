import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

/** Nombre de TAÉ **publiées** distinctes liées au document — `docs/FEATURES.md` §5.4. */
export async function countPublishedTacheUsagesForDocument(
  supabase: Client,
  documentId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("tache_documents")
    .select("tae_id, tache!inner(is_published)")
    .eq("document_id", documentId)
    .eq("tache.is_published", true);

  if (error || !data?.length) return 0;
  return new Set(data.map((row) => row.tae_id)).size;
}
