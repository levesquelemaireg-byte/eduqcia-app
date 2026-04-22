"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeleteEvaluationActionResult =
  | { ok: true }
  | { ok: false; code: "auth" | "forbidden" | "not_found" | "db" };

/** Supprime une épreuve dont l'utilisateur est l'auteur (`eval_delete` RLS). Les lignes `evaluation_tache` sont supprimées automatiquement (ON DELETE CASCADE). */
export async function deleteEvaluationAction(
  evaluationId: string,
): Promise<DeleteEvaluationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const { data: row, error: fetchErr } = await supabase
    .from("evaluations")
    .select("id, auteur_id")
    .eq("id", evaluationId)
    .maybeSingle();

  if (fetchErr) return { ok: false, code: "db" };
  if (!row) return { ok: false, code: "not_found" };
  if (row.auteur_id !== user.id) return { ok: false, code: "forbidden" };

  const { error: delErr } = await supabase.from("evaluations").delete().eq("id", evaluationId);
  if (delErr) return { ok: false, code: "db" };

  revalidatePath("/evaluations");
  revalidatePath("/bank");
  revalidatePath("/dashboard");
  return { ok: true };
}
