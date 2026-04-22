import { createClient } from "@/lib/supabase/server";
import {
  isWizardDraftObsoletePayload,
  sanitizeHydratedState,
} from "@/lib/tache/tache-form-hydrate";
import { MY_QUESTIONS_WIZARD_PREVIEW_FALLBACK } from "@/lib/ui/ui-copy";
import { plainConsigneForMiniature } from "@/lib/tache/consigne-helpers";
import { truncateText } from "@/lib/utils/stripHtml";

/** Valeurs d’URL `?filtre=` — alignées sur `docs/DECISIONS.md` (page Mes tâches). */
export type MyTacheListFiltre = "toutes" | "brouillons" | "publiees";

/** Identifiant sentinelle pour la ligne « brouillon wizard » (pas d’UUID `tae`). */
export const MY_QUESTIONS_WIZARD_SERVER_DRAFT_ID = "wizard-server-draft" as const;

export function parseMyTacheListFiltre(raw: string | string[] | undefined): MyTacheListFiltre {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "brouillons" || v === "publiees" || v === "toutes") return v;
  return "toutes";
}

export type MyTacheRow = {
  id: string;
  consigne: string | null;
  is_published: boolean;
  updated_at: string;
  /** `true` : brouillon dans `tae_wizard_drafts` uniquement (voir `MY_QUESTIONS_WIZARD_SERVER_DRAFT_ID`). */
  isWizardServerDraft?: boolean;
};

export type MyEvaluationRow = {
  id: string;
  titre: string;
  is_published: boolean;
  updated_at: string;
};

export async function getMyTacheList(filtre: MyTacheListFiltre = "toutes"): Promise<MyTacheRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("tae")
    .select("id, consigne, is_published, updated_at")
    .eq("auteur_id", user.id)
    .eq("is_archived", false);

  if (filtre === "brouillons") {
    query = query.eq("is_published", false);
  } else if (filtre === "publiees") {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) return [];

  const tacheRows: MyTacheRow[] = (data ?? []).map((row) => ({
    id: row.id,
    consigne: row.consigne,
    is_published: row.is_published,
    updated_at: row.updated_at,
  }));

  if (filtre === "publiees") {
    return tacheRows;
  }

  const { data: draftRow, error: draftErr } = await supabase
    .from("tae_wizard_drafts")
    .select("payload, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (draftErr || !draftRow?.payload) {
    return tacheRows;
  }

  const rawPayload = draftRow.payload as unknown;
  if (isWizardDraftObsoletePayload(rawPayload)) {
    return tacheRows;
  }

  const hydrated = sanitizeHydratedState(rawPayload);
  const nbDocs = hydrated?.bloc2.nbDocuments ?? undefined;
  const rawPreview = hydrated?.bloc3.consigne?.trim()
    ? plainConsigneForMiniature(hydrated.bloc3.consigne, nbDocs ?? undefined)
    : "";
  const preview =
    rawPreview.length > 0 ? truncateText(rawPreview, 160) : MY_QUESTIONS_WIZARD_PREVIEW_FALLBACK;

  const wizardRow: MyTacheRow = {
    id: MY_QUESTIONS_WIZARD_SERVER_DRAFT_ID,
    consigne: preview,
    is_published: false,
    updated_at: draftRow.updated_at,
    isWizardServerDraft: true,
  };

  return [...tacheRows, wizardRow].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export async function getMyEvaluationsList(): Promise<MyEvaluationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("evaluations")
    .select("id, titre, is_published, updated_at")
    .eq("auteur_id", user.id)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as MyEvaluationRow[];
}
