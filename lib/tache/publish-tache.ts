/**
 * Publication TAÉ : préparation du payload + RPC `publish_tae_transaction` (transaction Postgres).
 * Découpage : `publish-tache-lookups`, `publish-tache-payload`, `publish-tache-rpc-errors`, `publish-tache-types`.
 * Voir `docs/ARCHITECTURE.md` (schéma, RPC) et `supabase/schema.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import type { Json } from "@/lib/types/database";
import { buildPublishPayload } from "@/lib/tache/publish-tache-payload";
import {
  getDisciplineId,
  getNiveauId,
  resolveCdId,
  resolveConnaissanceIds,
} from "@/lib/tache/publish-tache-lookups";
import { classifyPublishRpcError } from "@/lib/tache/publish-tache-rpc-errors";
import type { PublishTacheResult, TacheVersionSnapshot } from "@/lib/tache/publish-tache-types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { isWizardPublishReady } from "@/lib/tache/wizard-publish-guards";
import { detectVersionTrigger } from "@/lib/tache/publish-tache-version";

export type {
  PublishTacheFailureCode,
  PublishTacheResult,
  PublishTacheRpcPayload,
  TacheVersionSnapshot,
} from "@/lib/tache/publish-tache-types";
export { detectVersionTrigger } from "@/lib/tache/publish-tache-version";

/**
 * Crée la TAÉ publiée et les liaisons documents dans une transaction Postgres (RPC).
 * Appeler uniquement après `isWizardPublishReady`.
 */
export async function publishTacheFromFormState(
  supabase: SupabaseClient,
  auteurId: string,
  state: TacheFormState,
): Promise<PublishTacheResult> {
  if (!isWizardPublishReady(state)) return { ok: false, code: "validation" };

  const niveauId = await getNiveauId(supabase, state.bloc2.niveau);
  if (niveauId === null) return { ok: false, code: "lookup_niveau" };

  const discCode = state.bloc2.discipline.toUpperCase();
  const disciplineId = await getDisciplineId(supabase, discCode);
  if (disciplineId === null) return { ok: false, code: "lookup_discipline" };

  const cdId = await resolveCdId(supabase, disciplineId, state);
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc !== "geo" && cdId === null) return { ok: false, code: "lookup_cd" };

  const connIds = await resolveConnaissanceIds(supabase, disciplineId, state);
  if (connIds === null) return { ok: false, code: "lookup_connaissance" };

  const built = buildPublishPayload(auteurId, state, {
    niveauId,
    disciplineId,
    cdId,
    connIds,
  });
  if ("error" in built) return { ok: false, code: built.error };

  const payload = built;

  const { data: tacheId, error: rpcErr } = await supabase.rpc("publish_tae_transaction", {
    p_payload: payload as unknown as Json,
  });

  if (rpcErr) {
    console.error("publish_tae_transaction:", rpcErr.message ?? rpcErr, rpcErr);
    return { ok: false, code: classifyPublishRpcError(rpcErr) };
  }

  if (typeof tacheId !== "string") {
    return { ok: false, code: "tae_insert" };
  }

  return {
    ok: true,
    tacheId,
    unpublishedDocumentsCreated: payload.documents_new.length > 0,
    wasMajorBump: false,
  };
}

/**
 * Met à jour une TAÉ existante (même payload que `publish_tae_transaction`, RPC `update_tae_transaction`).
 * Appeler uniquement après `isWizardPublishReady`.
 */
export async function updateTacheFromFormState(
  supabase: SupabaseClient,
  auteurId: string,
  tacheId: string,
  state: TacheFormState,
): Promise<PublishTacheResult> {
  if (!isWizardPublishReady(state)) return { ok: false, code: "validation" };

  const niveauId = await getNiveauId(supabase, state.bloc2.niveau);
  if (niveauId === null) return { ok: false, code: "lookup_niveau" };

  const discCode = state.bloc2.discipline.toUpperCase();
  const disciplineId = await getDisciplineId(supabase, discCode);
  if (disciplineId === null) return { ok: false, code: "lookup_discipline" };

  const cdId = await resolveCdId(supabase, disciplineId, state);
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc !== "geo" && cdId === null) return { ok: false, code: "lookup_cd" };

  const connIds = await resolveConnaissanceIds(supabase, disciplineId, state);
  if (connIds === null) return { ok: false, code: "lookup_connaissance" };

  const built = buildPublishPayload(auteurId, state, {
    niveauId,
    disciplineId,
    cdId,
    connIds,
  });
  if ("error" in built) return { ok: false, code: built.error };

  const payload = built;

  // Snapshot des champs majeurs avant mise à jour — pour calculer wasMajorBump
  let snapshot: TacheVersionSnapshot | null = null;
  const { data: tacheRow } = await supabase
    .from("tae")
    .select("oi_id, comportement_id, cd_id, connaissances_ids, niveau_id, discipline_id")
    .eq("id", tacheId)
    .single();
  const { data: docRows } = await supabase
    .from("tae_documents")
    .select("document_id")
    .eq("tae_id", tacheId);
  if (tacheRow) {
    snapshot = {
      oi_id: tacheRow.oi_id ?? null,
      comportement_id: tacheRow.comportement_id ?? null,
      cd_id: tacheRow.cd_id ?? null,
      connaissances_ids: tacheRow.connaissances_ids ?? [],
      niveau_id: tacheRow.niveau_id ?? null,
      discipline_id: tacheRow.discipline_id ?? null,
      documentIds: (docRows ?? []).map((r) => r.document_id),
      // Champs frontend — non utilisés par detectVersionTrigger (backend path)
      niveauCode: "",
      disciplineCode: "",
      connRowIds: [],
      cdCritereId: null,
    };
  }

  const { data: outId, error: rpcErr } = await supabase.rpc("update_tae_transaction", {
    p_tae_id: tacheId,
    p_payload: payload as unknown as Json,
  });

  if (rpcErr) {
    console.error("update_tae_transaction:", rpcErr.message ?? rpcErr, rpcErr);
    return { ok: false, code: classifyPublishRpcError(rpcErr) };
  }

  if (typeof outId !== "string") {
    return { ok: false, code: "tae_insert" };
  }

  const wasMajorBump =
    snapshot !== null ? detectVersionTrigger(snapshot, payload) === "major_bump" : false;

  return {
    ok: true,
    tacheId: outId,
    unpublishedDocumentsCreated: payload.documents_new.length > 0,
    wasMajorBump,
  };
}
