"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeleteTaeActionResult =
  | { ok: true }
  | { ok: false; code: "auth" | "forbidden" | "in_use" | "not_found" | "db" };

/** Supprime une TAÉ dont l’utilisateur est l’auteur (`tae_delete` RLS). Bloqué si la tâche est référencée dans `evaluation_tae`. */
export async function deleteTaeAction(taeId: string): Promise<DeleteTaeActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const { data: row, error: fetchErr } = await supabase
    .from("tae")
    .select("id, auteur_id")
    .eq("id", taeId)
    .maybeSingle();

  if (fetchErr) return { ok: false, code: "db" };
  if (!row) return { ok: false, code: "not_found" };
  if (row.auteur_id !== user.id) return { ok: false, code: "forbidden" };

  const { count, error: countErr } = await supabase
    .from("evaluation_tae")
    .select("id", { count: "exact", head: true })
    .eq("tae_id", taeId);

  if (countErr) return { ok: false, code: "db" };
  if ((count ?? 0) > 0) return { ok: false, code: "in_use" };

  const { error: delErr } = await supabase.from("tae").delete().eq("id", taeId);
  if (delErr) return { ok: false, code: "db" };

  revalidatePath("/questions");
  return { ok: true };
}
