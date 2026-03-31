"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeHydratedState } from "@/lib/tae/tae-form-hydrate";
import {
  publishTaeFromFormState,
  updateTaeFromFormState,
  type PublishTaeFailureCode,
} from "@/lib/tae/publish-tae";

export type PublishTaeActionResult =
  | { ok: true; taeId: string; unpublishedDocumentsCreated?: boolean }
  | { ok: false; code: "auth" | "validation" }
  | { ok: false; code: "publish"; failure: PublishTaeFailureCode };

/** Identifiant `tae.id` (UUID) — forme permissive (toutes versions), pas seulement UUID v4. */
const TAE_ID_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Publie une TAÉ complète ou met à jour une existante (`lib/tae/publish-tae.ts`).
 * Deux arguments : évite les pertes de `editingTaeId` lors de la sérialisation RSC d’un seul objet imbriqué.
 */
export async function publishTaeAction(
  statePayload: unknown,
  editingTaeId: string | null = null,
): Promise<PublishTaeActionResult> {
  try {
    const state = sanitizeHydratedState(statePayload);
    if (!state) return { ok: false, code: "validation" };

    let editId: string | null = null;
    if (editingTaeId != null && editingTaeId !== "") {
      const trimmed = String(editingTaeId).trim();
      if (!TAE_ID_UUID_RE.test(trimmed)) return { ok: false, code: "validation" };
      editId = trimmed;
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, code: "auth" };

    if (editId) {
      const { data: owned, error: ownErr } = await supabase
        .from("tae")
        .select("id")
        .eq("id", editId)
        .eq("auteur_id", user.id)
        .maybeSingle();
      if (ownErr || !owned) return { ok: false, code: "validation" };

      const updateResult = await updateTaeFromFormState(supabase, user.id, editId, state);
      if (!updateResult.ok) return { ok: false, code: "publish", failure: updateResult.code };
      return {
        ok: true,
        taeId: editId,
        unpublishedDocumentsCreated: updateResult.unpublishedDocumentsCreated,
      };
    }

    const result = await publishTaeFromFormState(supabase, user.id, state);
    if (!result.ok) return { ok: false, code: "publish", failure: result.code };

    const { error: draftDeleteError } = await supabase
      .from("tae_wizard_drafts")
      .delete()
      .eq("user_id", user.id);
    if (draftDeleteError) {
      console.error("clear wizard draft after publish:", draftDeleteError.message);
    }

    return {
      ok: true,
      taeId: result.taeId,
      unpublishedDocumentsCreated: result.unpublishedDocumentsCreated,
    };
  } catch (error: unknown) {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error("publishTaeAction error:", {
      message: e?.message,
      code: e?.code,
      details: e?.details,
      hint: e?.hint,
    });
    return { ok: false, code: "publish", failure: "tae_insert" };
  }
}
