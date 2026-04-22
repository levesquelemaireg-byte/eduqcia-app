"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeHydratedState, serializeTacheFormState } from "@/lib/tache/tache-form-hydrate";

export type SaveWizardDraftResult =
  | { ok: true }
  | { ok: false; error: "validation" | "auth" | "database" };

/**
 * Enregistre le brouillon wizard en base (`tae_wizard_drafts`).
 * Validation : même pipeline que `sessionStorage` (`sanitizeHydratedState`).
 */
export async function saveWizardDraftAction(payload: unknown): Promise<SaveWizardDraftResult> {
  const parsed = sanitizeHydratedState(payload);
  if (!parsed) return { ok: false, error: "validation" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const row = {
    user_id: user.id,
    payload: serializeTacheFormState(parsed),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("tache_wizard_drafts").upsert(row, {
    onConflict: "user_id",
  });

  if (error) return { ok: false, error: "database" };
  revalidatePath("/dashboard");
  return { ok: true };
}

export type DeleteWizardDraftResult = { ok: true } | { ok: false; error: "auth" | "database" };

/** Supprime la ligne `tae_wizard_drafts` de l’utilisateur (liste Mes tâches). */
export async function deleteWizardDraftAction(): Promise<DeleteWizardDraftResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { error } = await supabase.from("tache_wizard_drafts").delete().eq("user_id", user.id);

  if (error) return { ok: false, error: "database" };
  revalidatePath("/dashboard");
  return { ok: true };
}
