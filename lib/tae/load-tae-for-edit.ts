/**
 * Charge une TAÉ existante depuis Supabase → `TaeFormState` pour `/questions/[id]/edit`.
 * Hydratation structurée en `bloc1`…`bloc7` (même modèle que le wizard « Créer une tâche »).
 */

import { readFile } from "fs/promises";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import {
  documentSlotsFromCount,
  type DisciplineCode,
  type DocumentSlotId,
  type NiveauCode,
} from "@/lib/tae/blueprint-helpers";
import {
  cdDataUrlForDiscipline,
  parseCdJsonArray,
  type CdCompetenceNode,
  type CdSelectionWithIds,
} from "@/lib/tae/cd-helpers";
import {
  connDataUrlForDiscipline,
  filterConnRowsByNiveau,
  parseConnJsonArray,
  rowToSelectionWithIds,
  type ConnRawRow,
} from "@/lib/tae/connaissances-helpers";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tae/document-helpers";
import { nonRedactionFromDbColumn } from "@/lib/tae/non-redaction/non-redaction-edit-hydrate";
import { initialAspects, type AspectSocieteKey } from "@/lib/tae/redaction-helpers";

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

export async function loadTaeFormStateForEdit(
  supabase: SupabaseClient,
  taeId: string,
  userId: string,
): Promise<TaeFormState | null> {
  const { data: t, error } = await supabase.from("tae").select("*").eq("id", taeId).maybeSingle();
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
    supabase.from("tae_documents").select("slot, document_id, ordre").eq("tae_id", taeId),
    supabase.from("tae_collaborateurs").select("user_id").eq("tae_id", taeId),
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
  for (const l of linksRes.data ?? []) {
    const link = l as { slot: string; document_id: string };
    docBySlot.set(link.slot, link.document_id);
  }
  const docIds = [...new Set(docBySlot.values())];

  const documents: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  if (docIds.length > 0) {
    const { data: docRows } = await supabase
      .from("documents")
      .select(
        "id, titre, type, contenu, image_url, source_citation, source_document_id, source_version, source_type, image_legende, image_legende_position, repere_temporel, annee_normalisee",
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
      const type = d.type === "iconographique" ? "iconographique" : "textuel";
      const sourceId =
        typeof d.source_document_id === "string" && d.source_document_id.length > 0
          ? d.source_document_id
          : null;
      const stRaw = d.source_type;
      const sourceType =
        stRaw === "primaire" || stRaw === "secondaire" ? stRaw : ("secondaire" as const);
      const legendPos = d.image_legende_position;
      const imageLegendePosition =
        legendPos === "haut_gauche" ||
        legendPos === "haut_droite" ||
        legendPos === "bas_gauche" ||
        legendPos === "bas_droite"
          ? legendPos
          : null;
      const imageLegende = typeof d.image_legende === "string" ? d.image_legende : "";
      const repereT = typeof d.repere_temporel === "string" ? d.repere_temporel : "";
      const anneeN =
        typeof d.annee_normalisee === "number" && Number.isFinite(d.annee_normalisee)
          ? Math.trunc(d.annee_normalisee)
          : null;
      const typeIcono = parseTypeIconographique(d.type_iconographique);
      if (sourceId) {
        documents[slotId] = {
          ...emptyDocumentSlot(),
          mode: "reuse",
          type,
          titre: typeof d.titre === "string" ? d.titre : "",
          contenu: typeof d.contenu === "string" ? d.contenu : "",
          source_citation: typeof d.source_citation === "string" ? d.source_citation : "",
          imageUrl: typeof d.image_url === "string" ? d.image_url : null,
          source_document_id: sourceId,
          source_version: typeof d.source_version === "number" ? d.source_version : null,
          update_available: false,
          reuse_author: "",
          reuse_source_citation: "",
          printImpressionScale: 1,
          source_type: sourceType,
          image_legende: imageLegende,
          image_legende_position: imageLegendePosition,
          repere_temporel: repereT,
          annee_normalisee: anneeN,
          type_iconographique: typeIcono,
        };
      } else {
        documents[slotId] = {
          ...emptyDocumentSlot(),
          mode: "create",
          type,
          titre: typeof d.titre === "string" ? d.titre : "",
          contenu: typeof d.contenu === "string" ? d.contenu : "",
          source_citation: typeof d.source_citation === "string" ? d.source_citation : "",
          imageUrl: typeof d.image_url === "string" ? d.image_url : null,
          source_document_id: null,
          source_version: null,
          update_available: false,
          reuse_author: "",
          reuse_source_citation: "",
          printImpressionScale: 1,
          source_type: sourceType,
          image_legende: imageLegende,
          image_legende_position: imageLegendePosition,
          repere_temporel: repereT,
          annee_normalisee: anneeN,
          type_iconographique: typeIcono,
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
  const connaissances: TaeFormState["bloc7"]["connaissances"] = [];
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
      .select("id, full_name")
      .in("id", collabIds);
    if (Array.isArray(profiles)) {
      for (const p of profiles) {
        const pr = p as { id: string; full_name: string };
        collaborateurs.push({ id: pr.id, displayName: pr.full_name || "—" });
      }
    }
  }

  const modeConception = row.conception_mode === "equipe" ? "equipe" : "seul";

  return {
    currentStep: 0,
    bloc1: {
      modeConception,
      collaborateurs,
    },
    bloc2: {
      niveau: niveauCode as NiveauCode,
      discipline,
      oiId: typeof row.oi_id === "string" ? row.oi_id : "",
      comportementId: typeof row.comportement_id === "string" ? row.comportement_id : "",
      nbLignes: typeof row.nb_lignes === "number" ? row.nb_lignes : 5,
      nbDocuments,
      outilEvaluation,
      documentSlots,
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
      consigneMode: "gabarit",
    },
    bloc4: { documents, perspectives: null, perspectivesTitre: "", moments: null, momentsTitre: "" },
    bloc5: {
      corrige: typeof row.corrige === "string" ? row.corrige : "",
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
