"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeHydratedState } from "@/lib/tache/tache-form-hydrate";
import {
  publishTacheFromFormState,
  updateTacheFromFormState,
  type PublishTacheFailureCode,
} from "@/lib/tache/publish-tache";

export type PublishTacheActionResult =
  | { ok: true; tacheId: string; unpublishedDocumentsCreated?: boolean; wasMajorBump?: boolean }
  | { ok: false; code: "auth" | "validation" }
  | { ok: false; code: "publish"; failure: PublishTacheFailureCode };

/** Identifiant `tache.id` (UUID) — forme permissive (toutes versions), pas seulement UUID v4. */
const TACHE_ID_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Publie une TAÉ complète ou met à jour une existante (`lib/tache/publish-tache.ts`).
 * Deux arguments : évite les pertes de `editingTacheId` lors de la sérialisation RSC d’un seul objet imbriqué.
 */
export async function publishTacheAction(
  statePayload: unknown,
  editingTacheId: string | null = null,
): Promise<PublishTacheActionResult> {
  try {
    const state = sanitizeHydratedState(statePayload);
    if (!state) return { ok: false, code: "validation" };

    let editId: string | null = null;
    if (editingTacheId != null && editingTacheId !== "") {
      const trimmed = String(editingTacheId).trim();
      if (!TACHE_ID_UUID_RE.test(trimmed)) return { ok: false, code: "validation" };
      editId = trimmed;
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, code: "auth" };

    if (editId) {
      const { data: owned, error: ownErr } = await supabase
        .from("tache")
        .select("id")
        .eq("id", editId)
        .eq("auteur_id", user.id)
        .maybeSingle();
      if (ownErr || !owned) return { ok: false, code: "validation" };

      const updateResult = await updateTacheFromFormState(supabase, user.id, editId, state);
      if (!updateResult.ok) return { ok: false, code: "publish", failure: updateResult.code };
      revalidatePath("/questions");
      revalidatePath("/dashboard");
      return {
        ok: true,
        tacheId: editId,
        unpublishedDocumentsCreated: updateResult.unpublishedDocumentsCreated,
        wasMajorBump: updateResult.wasMajorBump,
      };
    }

    const result = await publishTacheFromFormState(supabase, user.id, state);
    if (!result.ok) return { ok: false, code: "publish", failure: result.code };

    // Suppression brouillon : assurée par la RPC publish_tache_transaction (atomique).
    revalidatePath("/questions");
    revalidatePath("/dashboard");

    return {
      ok: true,
      tacheId: result.tacheId,
      unpublishedDocumentsCreated: result.unpublishedDocumentsCreated,
    };
  } catch (error: unknown) {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error("publishTacheAction error:", {
      message: e?.message,
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
    });
    return { ok: false, code: "publish", failure: "tache_insert" };
  }
}
