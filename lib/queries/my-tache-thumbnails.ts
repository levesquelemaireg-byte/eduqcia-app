/**
 * Query enrichie pour la liste Mes tâches en mode thumbnail.
 * Retourne les données minimales nécessaires à FicheThumbnail :
 * OI (id, titre, icone), niveau label, discipline label, nb documents, consigne.
 */

import { createClient } from "@/lib/supabase/server";
import { canonicalOiIcone } from "@/lib/tache/oi-canonical";
import {
  isWizardDraftObsoletePayload,
  sanitizeHydratedState,
} from "@/lib/tache/tache-form-hydrate";
import { plainConsigneForMiniature } from "@/lib/tache/consigne-helpers";
import { truncateText } from "@/lib/utils/stripHtml";
import { MY_QUESTIONS_WIZARD_PREVIEW_FALLBACK } from "@/lib/ui/ui-copy";
import type { MyTacheListFiltre } from "@/lib/queries/user-content";

export const MY_QUESTIONS_WIZARD_SERVER_DRAFT_ID = "wizard-server-draft" as const;

export type MyTacheThumbnailRow = {
  id: string;
  consigne: string;
  is_published: boolean;
  updated_at: string;
  auteur_id: string;
  oi: { id: string; titre: string; icone: string } | null;
  niveau: string;
  discipline: string;
  nbDocuments: number;
  /** Brouillon wizard serveur — affichage spécial. */
  isWizardServerDraft?: boolean;
};

export async function getMyTacheThumbnailList(
  filtre: MyTacheListFiltre = "toutes",
): Promise<MyTacheThumbnailRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("tae")
    .select(
      "id, consigne, is_published, updated_at, auteur_id, oi_id, comportement_id, niveau_id, discipline_id",
    )
    .eq("auteur_id", user.id)
    .eq("is_archived", false);

  if (filtre === "brouillons") {
    query = query.eq("is_published", false);
  } else if (filtre === "publiees") {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error || !data) return [];

  type RawRow = {
    id: string;
    consigne: string | null;
    is_published: boolean;
    updated_at: string;
    auteur_id: string;
    oi_id: string | null;
    comportement_id: string | null;
    niveau_id: number | null;
    discipline_id: number | null;
  };
  const rows = data as unknown as RawRow[];

  // Collect unique FK IDs for batch lookups
  const oiIds = [...new Set(rows.map((r) => r.oi_id).filter(Boolean))] as string[];
  const niveauIds = [...new Set(rows.map((r) => r.niveau_id).filter((v) => v != null))] as number[];
  const disciplineIds = [
    ...new Set(rows.map((r) => r.discipline_id).filter((v) => v != null)),
  ] as number[];
  const comportementIds = [
    ...new Set(rows.map((r) => r.comportement_id).filter(Boolean)),
  ] as string[];

  // Batch lookups in parallel
  const [oiRes, niveauRes, disciplineRes, compRes] = await Promise.all([
    oiIds.length > 0
      ? supabase.from("oi").select("id, titre").in("id", oiIds)
      : Promise.resolve({ data: [] as { id: string; titre: string }[] }),
    niveauIds.length > 0
      ? supabase.from("niveaux").select("id, label").in("id", niveauIds)
      : Promise.resolve({ data: [] as { id: number; label: string }[] }),
    disciplineIds.length > 0
      ? supabase.from("disciplines").select("id, label").in("id", disciplineIds)
      : Promise.resolve({ data: [] as { id: number; label: string }[] }),
    comportementIds.length > 0
      ? supabase.from("comportements").select("id, nb_documents").in("id", comportementIds)
      : Promise.resolve({ data: [] as { id: string; nb_documents: number | null }[] }),
  ]);

  const oiMap = new Map<string, string>();
  for (const o of (oiRes.data ?? []) as { id: string; titre: string }[]) {
    oiMap.set(o.id, o.titre);
  }
  const niveauMap = new Map<number, string>();
  for (const n of (niveauRes.data ?? []) as { id: number; label: string }[]) {
    niveauMap.set(n.id, n.label);
  }
  const disciplineMap = new Map<number, string>();
  for (const d of (disciplineRes.data ?? []) as { id: number; label: string }[]) {
    disciplineMap.set(d.id, d.label);
  }
  const compMap = new Map<string, number>();
  for (const c of (compRes.data ?? []) as { id: string; nb_documents: number | null }[]) {
    compMap.set(c.id, c.nb_documents ?? 0);
  }

  const tacheRows: MyTacheThumbnailRow[] = rows.map((r) => {
    const icone = canonicalOiIcone(r.oi_id);
    const oiTitre = r.oi_id ? (oiMap.get(r.oi_id) ?? "") : "";
    return {
      id: r.id,
      consigne: r.consigne ?? "",
      is_published: r.is_published,
      updated_at: r.updated_at,
      auteur_id: r.auteur_id,
      oi:
        r.oi_id && (oiTitre || icone)
          ? { id: r.oi_id, titre: oiTitre, icone: icone ?? "cognition" }
          : null,
      niveau: r.niveau_id != null ? (niveauMap.get(r.niveau_id) ?? "") : "",
      discipline: r.discipline_id != null ? (disciplineMap.get(r.discipline_id) ?? "") : "",
      nbDocuments: r.comportement_id ? (compMap.get(r.comportement_id) ?? 0) : 0,
    };
  });

  // Skip wizard drafts for "publiees" filter
  if (filtre === "publiees") {
    return tacheRows;
  }

  // Handle wizard server draft
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

  const wizardRow: MyTacheThumbnailRow = {
    id: MY_QUESTIONS_WIZARD_SERVER_DRAFT_ID,
    consigne: preview,
    is_published: false,
    updated_at: draftRow.updated_at,
    auteur_id: user.id,
    oi: null,
    niveau: "",
    discipline: "",
    nbDocuments: 0,
    isWizardServerDraft: true,
  };

  return [...tacheRows, wizardRow].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}
