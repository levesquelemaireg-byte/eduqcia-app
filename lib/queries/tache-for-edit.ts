/**
 * Réhydratation `TacheFormState` depuis une ligne `tache` publiée ou brouillon en base.
 * Sortie alignée sur `bloc1`…`bloc7` (`TacheFormState`).
 * Serveur uniquement — voir `docs/WORKFLOWS.md` (Mes tâches et édition).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import {
  BLUEPRINT_INITIAL_NB_LIGNES,
  documentSlotsFromCount,
  type DisciplineCode,
  type DocumentSlotId,
  type NiveauCode,
} from "@/lib/tache/blueprint-helpers";
import {
  filterConnRowsByNiveau,
  parseConnJsonArray,
  type ConnaissanceSelectionWithIds,
} from "@/lib/tache/connaissances-helpers";
import {
  matchDbConnaissancesToJsonSelections,
  type DbConnaissanceRow,
} from "@/lib/tache/connaissances-match-db-to-json";
import { initialCdFormSlice, parseCdJsonArray, type CdFormSlice } from "@/lib/tache/cd-helpers";
import { resolveCdSelectionIdsFromTree } from "@/lib/tache/cd-resolve-json-ids";
import type { DocumentElementJson } from "@/lib/types/document-element-json";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tache/document-helpers";
import {
  initialAspects,
  type AspectSocieteKey,
  type RedactionSlice,
} from "@/lib/tache/redaction-helpers";
import { nonRedactionFromDbColumn } from "@/lib/tache/non-redaction/non-redaction-edit-hydrate";
import { TACHE_FORM_STEP_COUNT, type TacheFormState } from "@/lib/tache/tache-form-state-types";
import type { TacheVersionSnapshot } from "@/lib/tache/publish-tache-types";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";

type TacheEditRow = {
  id: string;
  auteur_id: string;
  conception_mode: string;
  oi_id: string | null;
  comportement_id: string | null;
  cd_id: number | null;
  connaissances_ids: number[];
  consigne: string | null;
  guidage: string | null;
  corrige: string | null;
  nb_lignes: number | null;
  niveau_id: number | null;
  discipline_id: number | null;
  aspects_societe: string[] | null;
  non_redaction_data: unknown | null;
};

function asNiveauCode(code: string): NiveauCode | null {
  if (code === "sec1" || code === "sec2" || code === "sec3" || code === "sec4") return code;
  return null;
}

function asDisciplineCode(code: string): DisciplineCode | null {
  const c = code.trim().toLowerCase();
  if (c === "hec" || c === "geo" || c === "hqc") return c;
  return null;
}

function aspectsFromDb(dbAspects: string[] | null): RedactionSlice["aspects"] {
  const aspects = { ...initialAspects };
  const labels = new Set(dbAspects ?? []);
  for (const [key, label] of Object.entries(ASPECT_LABEL) as [AspectSocieteKey, string][]) {
    if (labels.has(label)) aspects[key] = true;
  }
  return aspects;
}

async function readPublicDataJson(fileName: string): Promise<unknown> {
  const abs = path.join(process.cwd(), "public", "data", fileName);
  const text = await readFile(abs, "utf-8");
  return JSON.parse(text) as unknown;
}

function slotDataForReuse(doc: {
  id: string;
  titre: string;
  type: string;
  elements: unknown;
  repere_temporel?: string | null;
  annee_normalisee?: number | null;
}): DocumentSlotData {
  const base = emptyDocumentSlot();
  const rawEls = (Array.isArray(doc.elements) ? doc.elements : []) as DocumentElementJson[];
  const el = rawEls[0];
  const st =
    el?.source_type === "primaire" || el?.source_type === "secondaire"
      ? el.source_type
      : "secondaire";
  const lp = el?.image_legende_position;
  const pos =
    lp === "haut_gauche" || lp === "haut_droite" || lp === "bas_gauche" || lp === "bas_droite"
      ? lp
      : null;
  return {
    ...base,
    mode: "reuse",
    type: doc.type === "iconographique" ? "iconographique" : "textuel",
    titre: doc.titre,
    contenu: el?.contenu ?? "",
    source_citation: el?.source_citation ?? "",
    imageUrl: el?.image_url ?? null,
    source_document_id: doc.id,
    source_version: null,
    update_available: false,
    reuse_author: "",
    reuse_source_citation: "",
    source_type: st,
    image_legende: el?.image_legende ?? "",
    image_legende_position: pos,
    repere_temporel: typeof doc.repere_temporel === "string" ? doc.repere_temporel : "",
    annee_normalisee:
      typeof doc.annee_normalisee === "number" && Number.isFinite(doc.annee_normalisee)
        ? Math.trunc(doc.annee_normalisee)
        : null,
  };
}

export type TacheEditResult = { state: TacheFormState; snapshot: TacheVersionSnapshot };

/**
 * Charge et mappe une TAÉ existante vers l’état wizard + snapshot de version.
 * Retourne `null` si accès refusé ou données insuffisantes.
 */
export async function fetchTacheFormStateForEdit(
  supabase: SupabaseClient,
  tacheId: string,
  userId: string,
): Promise<TacheEditResult | null> {
  const { data: rawTache, error: tacheErr } = await supabase
    .from("tache")
    .select(
      [
        "id",
        "auteur_id",
        "conception_mode",
        "oi_id",
        "comportement_id",
        "cd_id",
        "connaissances_ids",
        "consigne",
        "guidage",
        "corrige",
        "nb_lignes",
        "niveau_id",
        "discipline_id",
        "aspects_societe",
        "non_redaction_data",
      ].join(", "),
    )
    .eq("id", tacheId)
    .maybeSingle();

  if (tacheErr || !rawTache) return null;
  const t = rawTache as unknown as TacheEditRow;
  if (t.auteur_id !== userId) return null;
  if (!t.oi_id || !t.comportement_id || t.niveau_id == null || t.discipline_id == null) {
    return null;
  }

  const [niveauRes, disciplineRes, comportementRes, cdRes, collabRes, linksRes] = await Promise.all(
    [
      supabase.from("niveaux").select("code").eq("id", t.niveau_id).maybeSingle(),
      supabase.from("disciplines").select("code").eq("id", t.discipline_id).maybeSingle(),
      supabase
        .from("comportements")
        .select("nb_documents, outil_evaluation")
        .eq("id", t.comportement_id)
        .maybeSingle(),
      t.cd_id
        ? supabase
            .from("cd")
            .select("competence, composante, critere")
            .eq("id", t.cd_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("tache_collaborateurs").select("user_id").eq("tae_id", tacheId),
      supabase
        .from("tache_documents")
        .select("slot, document_id, ordre")
        .eq("tae_id", tacheId)
        .order("ordre", {
          ascending: true,
        }),
    ],
  );

  const niveauCodeRaw =
    niveauRes.data && "code" in niveauRes.data ? String(niveauRes.data.code) : "";
  const disciplineCodeRaw =
    disciplineRes.data && "code" in disciplineRes.data ? String(disciplineRes.data.code) : "";

  const niveau = asNiveauCode(niveauCodeRaw);
  const discipline = asDisciplineCode(disciplineCodeRaw);
  if (!niveau || !discipline) return null;

  const compData = comportementRes.data as {
    nb_documents: number | null;
    outil_evaluation: string;
  } | null;
  const nbDocuments = compData?.nb_documents;
  const outilEvaluation = compData?.outil_evaluation ?? null;
  if (nbDocuments == null || nbDocuments < 1) return null;

  const collabIds =
    collabRes.data
      ?.map((c: { user_id: string }) => c.user_id)
      .filter((uid: string) => uid !== t.auteur_id) ?? [];

  let collaborateurs: { id: string; displayName: string }[] = [];
  if (collabIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", collabIds);
    if (Array.isArray(profs)) {
      collaborateurs = profs.map((p) => {
        const row = p as { id: string; first_name: string; last_name: string };
        return {
          id: row.id,
          displayName: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "—",
        };
      });
    }
  }

  const modeConception: "" | "seul" | "equipe" = t.conception_mode === "equipe" ? "equipe" : "seul";

  const links = linksRes.data as { slot: string; document_id: string; ordre: number }[] | null;
  const docIds = links?.map((l) => l.document_id) ?? [];
  const docById = new Map<
    string,
    {
      id: string;
      titre: string;
      type: string;
      elements: unknown;
      repere_temporel?: string | null;
      annee_normalisee?: number | null;
    }
  >();

  if (docIds.length > 0) {
    const { data: docRows } = await supabase
      .from("documents")
      .select("id, titre, type, elements, repere_temporel, annee_normalisee")
      .in("id", docIds);
    if (Array.isArray(docRows)) {
      for (const d of docRows) {
        const row = d as {
          id: string;
          titre: string;
          type: string;
          elements: unknown;
          repere_temporel?: string | null;
          annee_normalisee?: number | null;
        };
        docById.set(row.id, row);
      }
    }
  }

  const documents: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  if (links) {
    for (const l of links) {
      const sid = l.slot as DocumentSlotId;
      if (sid !== "doc_A" && sid !== "doc_B" && sid !== "doc_C" && sid !== "doc_D") continue;
      const doc = docById.get(l.document_id);
      if (!doc) return null;
      documents[sid] = slotDataForReuse(doc);
    }
  }

  type SqlConnRow = DbConnaissanceRow;
  const connIds = t.connaissances_ids ?? [];
  const byNumericId = new Map<number, SqlConnRow>();
  if (connIds.length > 0) {
    const { data: connRows } = await supabase
      .from("connaissances")
      .select("id, realite_sociale, section, sous_section, enonce")
      .in("id", connIds);
    if (Array.isArray(connRows)) {
      for (const r of connRows) {
        const row = r as SqlConnRow;
        byNumericId.set(row.id, row);
      }
    }
  }
  const dbRowsOrdered: SqlConnRow[] = [];
  for (const cid of connIds) {
    const row = byNumericId.get(cid);
    if (!row) return null;
    dbRowsOrdered.push(row);
  }

  let connaissances: ConnaissanceSelectionWithIds[] = [];
  if (discipline === "geo") {
    connaissances = [];
  } else {
    const connFile = discipline === "hec" ? "hec-sec1-2.json" : "hqc-sec3-4.json";
    const rawConn = await readPublicDataJson(connFile);
    const allConn = parseConnJsonArray(rawConn, discipline);
    const filteredConn = filterConnRowsByNiveau(allConn, niveau);
    if (connIds.length > 0) {
      const matched = matchDbConnaissancesToJsonSelections(discipline, filteredConn, dbRowsOrdered);
      if (!matched) return null;
      connaissances = matched;
    }
  }

  const cdRow = cdRes.data as { competence: string; composante: string; critere: string } | null;
  let cdSlice: CdFormSlice;
  if (discipline === "geo" || !cdRow) {
    cdSlice = initialCdFormSlice;
  } else {
    const cdFile = discipline === "hec" ? "hec-cd.json" : "hqc-cd.json";
    const rawCd = await readPublicDataJson(cdFile);
    const cdNodes = parseCdJsonArray(rawCd);
    const resolved = resolveCdSelectionIdsFromTree(
      cdNodes,
      cdRow.competence,
      cdRow.composante,
      cdRow.critere,
    );
    if (!resolved) return null;
    cdSlice = { selection: resolved };
  }

  const aspectsResolved = aspectsFromDb(t.aspects_societe);

  for (const { slotId } of documentSlotsFromCount(nbDocuments)) {
    if (!documents[slotId]) return null;
  }

  const state: TacheFormState = {
    currentStep: TACHE_FORM_STEP_COUNT - 1,
    highestReachedStep: TACHE_FORM_STEP_COUNT - 1,
    bloc1: {
      modeConception,
      collaborateurs,
    },
    bloc2: {
      niveau,
      discipline,
      oiId: t.oi_id,
      comportementId: t.comportement_id,
      nbLignes: t.nb_lignes ?? BLUEPRINT_INITIAL_NB_LIGNES,
      nbDocuments,
      outilEvaluation,
      documentSlots: documentSlotsFromCount(nbDocuments),
      blueprintLocked: true,
    },
    bloc3: {
      consigne: t.consigne ?? "",
      guidage: t.guidage ?? "",
      perspectivesMode: null,
      perspectivesType: "acteurs",
      perspectivesContexte: "",
      oi6Enjeu: "",
      oi7EnjeuGlobal: "",
      oi7Element1: "",
      oi7Element2: "",
      oi7Element3: "",
      consigneMode:
        getWizardBlocConfig(t.comportement_id ?? "")?.bloc3.type === "pur"
          ? "personnalisee"
          : "gabarit",
    },
    bloc4: {
      documents,
      perspectives: null,
      perspectivesTitre: "",
      moments: null,
      momentsTitre: "",
    },
    bloc5: {
      corrige: t.corrige ?? "",
      notesCorrecteur: "",
      nonRedaction: nonRedactionFromDbColumn(t.comportement_id ?? "", t.non_redaction_data),
      intrus: null,
    },
    bloc6: { cd: cdSlice },
    bloc7: { aspects: aspectsResolved, connaissances },
  };

  const snapshot: TacheVersionSnapshot = {
    oi_id: t.oi_id,
    comportement_id: t.comportement_id,
    cd_id: t.cd_id ?? null,
    connaissances_ids: t.connaissances_ids ?? [],
    niveau_id: t.niveau_id,
    discipline_id: t.discipline_id,
    documentIds: (links ?? []).map((l) => l.document_id),
    niveauCode: niveau,
    disciplineCode: discipline,
    connRowIds: connaissances.map((c) => c.rowId),
    cdCritereId: cdSlice.selection?.critereId ?? null,
  };

  return { state, snapshot };
}
