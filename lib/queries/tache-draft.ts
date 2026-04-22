import { createClient } from "@/lib/supabase/server";
import {
  isWizardDraftObsoletePayload,
  sanitizeHydratedState,
} from "@/lib/tache/tache-form-hydrate";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

export type WizardDraftLoadResult =
  | { status: "none" }
  | { status: "ok"; state: TacheFormState }
  | { status: "obsolete" };

/** Brouillon serveur pour la page « Créer une TAÉ » (`tae_wizard_drafts`). */
export async function getWizardDraftForUser(): Promise<WizardDraftLoadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "none" };

  const { data, error } = await supabase
    .from("tache_wizard_drafts")
    .select("payload")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.payload) return { status: "none" };

  const raw = data.payload as unknown;
  if (isWizardDraftObsoletePayload(raw)) {
    return { status: "obsolete" };
  }

  const state = sanitizeHydratedState(raw);
  if (!state) return { status: "none" };
  return { status: "ok", state };
}
