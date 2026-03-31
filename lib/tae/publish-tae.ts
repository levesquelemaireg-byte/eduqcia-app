/**
 * Publication TAÉ : préparation du payload + RPC `publish_tae_transaction` (transaction Postgres).
 * Découpage : `publish-tae-lookups`, `publish-tae-payload`, `publish-tae-rpc-errors`, `publish-tae-types`.
 * Voir `docs/ARCHITECTURE.md` (schéma, RPC) et `supabase/schema.sql`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import type { Json } from "@/lib/types/database";
import { buildPublishPayload } from "@/lib/tae/publish-tae-payload";
import {
  getDisciplineId,
  getNiveauId,
  resolveCdId,
  resolveConnaissanceIds,
} from "@/lib/tae/publish-tae-lookups";
import { classifyPublishRpcError } from "@/lib/tae/publish-tae-rpc-errors";
import type { PublishTaeResult } from "@/lib/tae/publish-tae-types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { isWizardPublishReady } from "@/lib/tae/wizard-publish-guards";

export type {
  PublishTaeFailureCode,
  PublishTaeResult,
  PublishTaeRpcPayload,
} from "@/lib/tae/publish-tae-types";

/**
 * Crée la TAÉ publiée et les liaisons documents dans une transaction Postgres (RPC).
 * Appeler uniquement après `isWizardPublishReady`.
 */
export async function publishTaeFromFormState(
  supabase: SupabaseClient,
  auteurId: string,
  state: TaeFormState,
): Promise<PublishTaeResult> {
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

  const { data: taeId, error: rpcErr } = await supabase.rpc("publish_tae_transaction", {
    p_payload: payload as unknown as Json,
  });

  if (rpcErr) {
    console.error("publish_tae_transaction:", rpcErr.message ?? rpcErr, rpcErr);
    return { ok: false, code: classifyPublishRpcError(rpcErr) };
  }

  if (typeof taeId !== "string") {
    return { ok: false, code: "tae_insert" };
  }

  return {
    ok: true,
    taeId,
    unpublishedDocumentsCreated: payload.documents_new.length > 0,
  };
}

/**
 * Met à jour une TAÉ existante (même payload que `publish_tae_transaction`, RPC `update_tae_transaction`).
 * Appeler uniquement après `isWizardPublishReady`.
 */
export async function updateTaeFromFormState(
  supabase: SupabaseClient,
  auteurId: string,
  taeId: string,
  state: TaeFormState,
): Promise<PublishTaeResult> {
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

  const { data: outId, error: rpcErr } = await supabase.rpc("update_tae_transaction", {
    p_tae_id: taeId,
    p_payload: payload as unknown as Json,
  });

  if (rpcErr) {
    console.error("update_tae_transaction:", rpcErr.message ?? rpcErr, rpcErr);
    return { ok: false, code: classifyPublishRpcError(rpcErr) };
  }

  if (typeof outId !== "string") {
    return { ok: false, code: "tae_insert" };
  }

  return {
    ok: true,
    taeId: outId,
    unpublishedDocumentsCreated: payload.documents_new.length > 0,
  };
}
