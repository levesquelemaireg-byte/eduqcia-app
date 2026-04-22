"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeleteDocumentActionResult =
  | { ok: true }
  | { ok: false; code: "auth" | "forbidden" | "in_use" | "not_found" | "db" };

/** Supprime un document dont l'utilisateur est l'auteur (`documents_delete` RLS). Bloqué si le document est référencé dans `tae_documents` (FK RESTRICT). */
export async function deleteDocumentAction(
  documentId: string,
): Promise<DeleteDocumentActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const { data: row, error: fetchErr } = await supabase
    .from("documents")
    .select("id, auteur_id")
    .eq("id", documentId)
    .maybeSingle();

  if (fetchErr) return { ok: false, code: "db" };
  if (!row) return { ok: false, code: "not_found" };
  if (row.auteur_id !== user.id) return { ok: false, code: "forbidden" };

  // Guard FK : tae_documents.document_id ON DELETE RESTRICT
  const { count, error: countErr } = await supabase
    .from("tache_documents")
    .select("id", { count: "exact", head: true })
    .eq("document_id", documentId);

  if (countErr) return { ok: false, code: "db" };
  if ((count ?? 0) > 0) return { ok: false, code: "in_use" };

  const { error: delErr } = await supabase.from("documents").delete().eq("id", documentId);
  if (delErr) return { ok: false, code: "db" };

  revalidatePath("/documents");
  revalidatePath("/bank");
  revalidatePath("/dashboard");
  return { ok: true };
}
