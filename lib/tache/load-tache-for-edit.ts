/**
 * Charge une TAÉ existante depuis Supabase → `TacheFormState` pour `/questions/[id]/edit`.
 * Hydratation structurée en `bloc1`…`bloc7` (même modèle que le wizard « Créer une tâche »).
 */

import { readFile } from "fs/promises";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TACHE_FORM_STEP_COUNT, type TacheFormState } from "@/lib/tache/tache-form-state-types";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import {
  documentSlotsFromCount,
  type DisciplineCode,
  type DocumentSlotId,
  type NiveauCode,
} from "@/lib/tache/blueprint-helpers";
import {
  cdDataUrlForDiscipline,
  parseCdJsonArray,
  type CdCompetenceNode,
  type CdSelectionWithIds,
} from "@/lib/tache/cd-helpers";
import {
  connDataUrlForDiscipline,
  filterConnRowsByNiveau,
  parseConnJsonArray,
  rowToSelectionWithIds,
  type ConnRawRow,
} from "@/lib/tache/connaissances-helpers";
import { parseCategorieTextuelle } from "@/lib/documents/categorie-textuelle";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import type { DocumentElementJson } from "@/lib/types/document-element-json";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tache/document-helpers";
import { nonRedactionFromDbColumn } from "@/lib/tache/non-redaction/non-redaction-edit-hydrate";
import { initialAspects, type AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import { sanitizeSchemaCd1FromDb } from "@/lib/tache/schema-cd1/sanitize-from-db";
import type { SchemaCd1Data } from "@/lib/tache/schema-cd1/types";

const ASPECT_DB_TO_KEY: Record<string, AspectSocieteKey> = {
  Économique: "economique",
  Politique: "politique",
  Social: "social",
  Culturel: "culturel",
  Territorial: "territorial",
};

function findCdSelection(
  tree: CdCompetenceNode[],
  competence: string,
  composante: string,
  critere: string,
): CdSelectionWithIds | null {
  for (const comp of tree) {
    if (comp.titre !== competence) continue;
    for (const compos of comp.composantes) {
      if (compos.titre !== composante) continue;
      for (const crit of compos.criteres) {
        if (crit.texte === critere) {
          return {
            competence,
            composante,
            critere,
            competenceId: comp.id,
            composanteId: compos.id,
            critereId: crit.id,
          };
        }
      }
    }
  }
  return null;
}

async function loadCdJson(discipline: DisciplineCode): Promise<CdCompetenceNode[]> {
  const url = cdDataUrlForDiscipline(discipline);
  if (!url) return [];
  const raw = await readFile(path.join(process.cwd(), "public", url.replace(/^\//, "")), "utf8");
  return parseCdJsonArray(JSON.parse(raw) as unknown);
}

async function loadConnRows(discipline: DisciplineCode): Promise<ConnRawRow[]> {
  const url = connDataUrlForDiscipline(discipline);
  if (!url) return [];
  const raw = await readFile(path.join(process.cwd(), "public", url.replace(/^\//, "")), "utf8");
  return parseConnJsonArray(JSON.parse(raw) as unknown, discipline);
}

export async function loadTacheFormStateForEdit(
  supabase: SupabaseClient,
  tacheId: string,
  userId: string,
): Promise<TacheFormState | null> {
  const { data: t, error } = await supabase
    .from("tache")
    .select(
      "id, auteur_id, consigne, guidage, corrige, nb_lignes, oi_id, comportement_id, niveau_id, discipline_id, cd_id, connaissances_ids, aspects_societe, version, is_published, non_redaction_data, conception_mode, type_tache, schema_cd1_data",
    )
    .eq("id", tacheId)
    .maybeSingle();
  if (error || !t) return null;
  const row = t as Record<string, unknown>;
  if (row.auteur_id !== userId) return null;

  const niveauId = row.niveau_id as number | null;
  const disciplineId = row.discipline_id as number | null;
  if (niveauId == null || disciplineId == null) return null;

  const [nRes, dRes, compRes, linksRes, collabRes] = await Promise.all([
    supabase.from("niveaux").select("code").eq("id", niveauId).maybeSingle(),
    supabase.from("disciplines").select("code").eq("id", disciplineId).maybeSingle(),
    row.comportement_id
      ? supabase
          .from("comportements")
          .select("nb_documents, outil_evaluation")
          .eq("id", String(row.comportement_id))
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("tache_documents")
      .select("slot, document_id, ordre, est_leurre, cases_associees")
      .eq("tae_id", tacheId),
    supabase.from("tache_collaborateurs").select("user_id").eq("tae_id", tacheId),
  ]);
  const nRow = nRes.data;
  const dRow = dRes.data;

  const niveauCode = (nRow as { code?: string } | null)?.code ?? "";
  const discCodeUpper = (dRow as { code?: string } | null)?.code ?? "";
  const discipline = discCodeUpper.toLowerCase() as DisciplineCode;

  if (!niveauCode || !discipline) return null;

  const compData = compRes.data as { nb_documents: number | null; outil_evaluation: string } | null;
  const nbDocuments = compData?.nb_documents ?? null;
  const outilEvaluation = compData?.outil_evaluation ?? null;

  const documentSlots =
    nbDocuments != null
      ? documentSlotsFromCount(nbDocuments)
      : documentSlotsFromCount(
          Math.min(3, Math.max(1, (linksRes.data as { slot: string }[] | null)?.length ?? 1)),
        );

  const docBySlot = new Map<string, string>();
  const pertinenceBySlot = new Map<string, { estLeurre: boolean; cases: string[] }>();
  for (const l of linksRes.data ?? []) {
    const link = l as {
      slot: string;
      document_id: string;
      est_leurre?: boolean;
      cases_associees?: string[];
    };
    docBySlot.set(link.slot, link.document_id);
    pertinenceBySlot.set(link.slot, {
      estLeurre: Boolean(link.est_leurre),
      cases: Array.isArray(link.cases_associees) ? link.cases_associees : [],
    });
  }
  const docIds = [...new Set(docBySlot.values())];

  const documents: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  if (docIds.length > 0) {
    const { data: docRows } = await supabase
      .from("documents")
      .select(
        "id, titre, type, elements, source_document_id, source_version, repere_temporel, annee_normalisee",
      )
      .in("id", docIds);
    const byId = new Map<string, Record<string, unknown>>();
    if (Array.isArray(docRows)) {
      for (const d of docRows) {
        const dr = d as Record<string, unknown>;
        byId.set(String(dr.id), dr);
      }
    }
    for (const { slotId } of documentSlots) {
      const did = docBySlot.get(slotId);
      if (!did) {
        documents[slotId] = { ...emptyDocumentSlot(), mode: "idle" };
        continue;
      }
      const d = byId.get(did);
      if (!d) {
        documents[slotId] = { ...emptyDocumentSlot(), mode: "idle" };
        continue;
      }
      const type: "textuel" | "iconographique" =
        d.type === "iconographique" ? "iconographique" : "textuel";
      const sourceId =
        typeof d.source_document_id === "string" && d.source_document_id.length > 0
          ? d.source_document_id
          : null;

      const rawElements = (Array.isArray(d.elements) ? d.elements : []) as DocumentElementJson[];
      const firstEl = rawElements[0];

      const stRaw = firstEl?.source_type;
      const sourceType =
        stRaw === "primaire" || stRaw === "secondaire" ? stRaw : ("secondaire" as const);
      const legendPos = firstEl?.image_legende_position;
      const imageLegendePosition:
        | "haut_gauche"
        | "haut_droite"
        | "bas_gauche"
        | "bas_droite"
        | null =
        legendPos === "haut_gauche" ||
        legendPos === "haut_droite" ||
        legendPos === "bas_gauche" ||
        legendPos === "bas_droite"
          ? legendPos
          : null;
      const imageLegende = firstEl?.image_legende ?? "";
      const repereT = typeof d.repere_temporel === "string" ? d.repere_temporel : "";
      const anneeN =
        typeof d.annee_normalisee === "number" && Number.isFinite(d.annee_normalisee)
          ? Math.trunc(d.annee_normalisee)
          : null;
      const typeIcono = parseTypeIconographique(firstEl?.categorie_iconographique);
      const categorieTextuelle = parseCategorieTextuelle(firstEl?.categorie_textuelle);
      const pertinence = pertinenceBySlot.get(slotId);

      const baseSlot = {
        ...emptyDocumentSlot(),
        type,
        titre: typeof d.titre === "string" ? d.titre : "",
        contenu: firstEl?.contenu ?? "",
        source_citation: firstEl?.source_citation ?? "",
        imageUrl: firstEl?.image_url ?? null,
        update_available: false,
        reuse_author: "",
        reuse_source_citation: "",
        source_type: sourceType,
        image_legende: imageLegende,
        image_legende_position: imageLegendePosition,
        repere_temporel: repereT,
        annee_normalisee: anneeN,
        type_iconographique: typeIcono,
        categorie_textuelle: categorieTextuelle,
        estLeurre: pertinence?.estLeurre ?? false,
        casesAssociees: (pertinence?.cases ?? []).filter(
          (c): c is import("@/lib/tache/schema-cd1/types").CleCase =>
            (
              [
                "objet",
                "blocA.pivot",
                "blocA.precision1",
                "blocA.precision2",
                "blocB.pivot",
                "blocB.precision1",
                "blocB.precision2",
              ] as const
            ).includes(c as import("@/lib/tache/schema-cd1/types").CleCase),
        ),
      };

      if (sourceId) {
        documents[slotId] = {
          ...baseSlot,
          mode: "reuse",
          source_document_id: sourceId,
          source_version: typeof d.source_version === "number" ? d.source_version : null,
        };
      } else {
        documents[slotId] = {
          ...baseSlot,
          mode: "create",
          source_document_id: null,
          source_version: null,
        };
      }
    }
  }

  const aspectsRaw = (row.aspects_societe as string[] | null) ?? [];
  const aspects = { ...initialAspects };
  for (const a of aspectsRaw) {
    const k = ASPECT_DB_TO_KEY[a];
    if (k) aspects[k] = true;
  }

  let cdSelection: CdSelectionWithIds | null = null;
  if (discipline !== "geo" && row.cd_id != null) {
    const { data: cdRow } = await supabase
      .from("cd")
      .select("competence, composante, critere")
      .eq("id", row.cd_id as number)
      .maybeSingle();
    if (cdRow) {
      const cr = cdRow as { competence: string; composante: string; critere: string };
      const tree = await loadCdJson(discipline);
      cdSelection = findCdSelection(tree, cr.competence, cr.composante, cr.critere);
    }
  }

  const connaissancesIds = (row.connaissances_ids as number[] | null) ?? [];
  const connaissances: TacheFormState["bloc7"]["connaissances"] = [];
  if (discipline !== "geo" && connaissancesIds.length > 0) {
    const { data: connDbRows } = await supabase
      .from("connaissances")
      .select("id, realite_sociale, section, sous_section, enonce")
      .in("id", connaissancesIds);
    const allConn = await loadConnRows(discipline);
    const filtered = filterConnRowsByNiveau(allConn, niveauCode as NiveauCode);
    const byKey = new Map<string, ConnRawRow>();
    for (const r of filtered) {
      const key = (rs: string) => `${rs}|${r.section}|${r.sous_section ?? ""}|${r.enonce}`;
      if (r.kind === "hqc") {
        const composite = `${r.periode} — ${r.realite_sociale}`;
        byKey.set(key(r.realite_sociale), r);
        byKey.set(key(composite), r);
      } else {
        byKey.set(key(r.realite_sociale), r);
      }
    }
    if (Array.isArray(connDbRows)) {
      for (const c of connDbRows) {
        const db = c as {
          realite_sociale: string;
          section: string;
          sous_section: string | null;
          enonce: string;
        };
        const key = `${db.realite_sociale}|${db.section}|${db.sous_section ?? ""}|${db.enonce}`;
        const match = byKey.get(key);
        if (match) connaissances.push(rowToSelectionWithIds(match));
      }
    }
  }

  const collaborateurs: { id: string; displayName: string }[] = [];
  const collabIds =
    collabRes.data?.map((c: { user_id: string }) => c.user_id).filter((id: string) => id) ?? [];
  if (collabIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", collabIds);
    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        const pr = p as { id: string; first_name: string; last_name: string };
        collaborateurs.push({
          id: pr.id,
          displayName: `${pr.first_name} ${pr.last_name}`.trim() || "—",
        });
      }
    }
  }

  const modeConception = row.conception_mode === "equipe" ? "equipe" : "seul";
  const rawTypeTache = row.type_tache;
  const typeTache =
    rawTypeTache === "section_a" || rawTypeTache === "section_b" || rawTypeTache === "section_c"
      ? rawTypeTache
      : ("section_a" as const);

  let schemaCd1: SchemaCd1Data | null = null;
  if (typeTache === "section_b") {
    schemaCd1 = sanitizeSchemaCd1FromDb(row.schema_cd1_data);
  }

  return {
    currentStep: TACHE_FORM_STEP_COUNT - 1,
    highestReachedStep: TACHE_FORM_STEP_COUNT - 1,
    bloc1: {
      modeConception,
      collaborateurs,
    },
    bloc2: {
      niveau: niveauCode as NiveauCode,
      discipline,
      typeTache,
      oiId: typeof row.oi_id === "string" ? row.oi_id : "",
      comportementId: typeof row.comportement_id === "string" ? row.comportement_id : "",
      nbLignes: typeof row.nb_lignes === "number" ? row.nb_lignes : 5,
      nbDocuments,
      outilEvaluation,
      documentSlots,
      aspectA: null,
      aspectB: null,
      blueprintLocked: true,
    },
    bloc3: {
      consigne: typeof row.consigne === "string" ? row.consigne : "",
      guidage: typeof row.guidage === "string" ? row.guidage : "",
      perspectivesMode: null,
      perspectivesType: "acteurs",
      perspectivesContexte: "",
      oi6Enjeu: "",
      oi7EnjeuGlobal: "",
      oi7Element1: "",
      oi7Element2: "",
      oi7Element3: "",
      consigneMode:
        getWizardBlocConfig(typeof row.comportement_id === "string" ? row.comportement_id : "")
          ?.bloc3.type === "pur"
          ? "personnalisee"
          : "gabarit",
      schemaCd1,
    },
    bloc4: {
      documents,
      perspectives: null,
      perspectivesTitre: "",
      moments: null,
      momentsTitre: "",
    },
    bloc5: {
      corrige: typeof row.corrige === "string" ? row.corrige : "",
      notesCorrecteur: "",
      nonRedaction: nonRedactionFromDbColumn(
        typeof row.comportement_id === "string" ? row.comportement_id : "",
        row.non_redaction_data,
      ),
      intrus: null,
    },
    bloc6: { cd: { selection: cdSelection } },
    bloc7: { aspects, connaissances },
  };
}
