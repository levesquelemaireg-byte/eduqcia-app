"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  parseEvaluationCompositionBody,
  type EvaluationCompositionBody,
} from "@/lib/schemas/evaluation-composition";

export type SaveEvaluationErrorCode =
  | "auth"
  | "validation"
  | "titre_requis"
  | "titre_trop_long"
  | "publication_sans_tache"
  | "doublon"
  | "uuid_invalide"
  | "compte_inactif"
  | "non_authentifie"
  | "evaluation_introuvable"
  | "tache_non_eligible"
  | "tache_dupliquee"
  | "rpc_function_missing"
  | "rpc_unknown";

export type SaveEvaluationResult =
  | { ok: true; evaluationId: string }
  | { ok: false; code: SaveEvaluationErrorCode };

function classifyRpcMessage(message: string): SaveEvaluationErrorCode {
  const m = message.toLowerCase();
  if (
    m.includes("could not find the function") ||
    m.includes("no matches were found in the schema cache") ||
    m.includes("pgrst202")
  ) {
    return "rpc_function_missing";
  }
  if (m.includes("titre requis")) return "titre_requis";
  if (m.includes("publication sans tâche")) return "publication_sans_tache";
  if (m.includes("tâche dupliquée")) return "tache_dupliquee";
  if (m.includes("tâche non éligible")) return "tache_non_eligible";
  if (m.includes("évaluation introuvable") || m.includes("épreuve introuvable"))
    return "evaluation_introuvable";
  if (m.includes("compte inactif")) return "compte_inactif";
  if (m.includes("non authentifié")) return "non_authentifie";
  return "rpc_unknown";
}

function zodCodeToError(code: string): SaveEvaluationErrorCode {
  switch (code) {
    case "titre_requis":
      return "titre_requis";
    case "titre_trop_long":
      return "titre_trop_long";
    case "publication_sans_tache":
      return "publication_sans_tache";
    case "doublon":
      return "doublon";
    case "uuid_invalide":
      return "uuid_invalide";
    default:
      return "validation";
  }
}

export async function saveEvaluationCompositionAction(
  raw: unknown,
  publish: boolean,
): Promise<SaveEvaluationResult> {
  const parsed = parseEvaluationCompositionBody(raw, publish);
  if (!parsed.ok) {
    return { ok: false, code: zodCodeToError(parsed.code) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const body: EvaluationCompositionBody = parsed.data;

  const { data: evalId, error } = await supabase.rpc("save_evaluation_composition", {
    p_evaluation_id: body.evaluationId,
    p_titre: body.titre,
    p_tae_ids: body.tacheIds,
    p_publish: publish,
  });

  if (error) {
    return { ok: false, code: classifyRpcMessage(`${error.message}\n${error.details ?? ""}`) };
  }

  if (typeof evalId !== "string" || !evalId) {
    return { ok: false, code: "rpc_unknown" };
  }

  revalidatePath("/evaluations");
  revalidatePath(`/evaluations/${evalId}/edit`);
  return { ok: true, evaluationId: evalId };
}

export type DraftEvaluationOption = { id: string; titre: string };

export async function listDraftEvaluationsAction(): Promise<DraftEvaluationOption[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("evaluations")
    .select("id, titre")
    .eq("auteur_id", user.id)
    .eq("is_archived", false)
    .eq("is_published", false)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as DraftEvaluationOption[];
}
