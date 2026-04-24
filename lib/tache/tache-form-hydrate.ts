/**
 * Parse / assainissement du brouillon TAÉ (sessionStorage, serveur JSONB).
 * Forme **v7 uniquement** (`bloc1` … `bloc7`) — pas de migration depuis l’ancien schéma.
 * Partagé client / serveur — pas de `"use client"`.
 */

import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tache/document-helpers";
import { sanitizeCdFormSlice } from "@/lib/tache/cd-helpers";
import { sanitizeConnaissances } from "@/lib/tache/connaissances-helpers";
import {
  SCHEMA_CD1_INITIAL,
  TOUTES_LES_CASES,
  type CleCase,
  type SchemaCd1Data,
} from "@/lib/tache/schema-cd1/types";
import { normalizeAvantApresPayload } from "@/lib/tache/non-redaction/avant-apres-payload";
import { normalizeLigneDuTempsPayload } from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import { normalizeOrdreChronologiquePayload } from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import { initialAspects } from "@/lib/tache/redaction-helpers";
import { isProfileCollaborateurId } from "@/lib/tache/collaborateur-user-ids";
import {
  TACHE_FORM_STEP_COUNT,
  initialBlueprint,
  initialBloc5,
  initialBloc7,
  initialConception,
  type BlueprintSlice,
  type Bloc5Slice,
  type Bloc7Slice,
  type ConceptionSlice,
  type NonRedactionData,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";

function sanitizeImageUploadMeta(raw: unknown): DocumentSlotData["imageUploadMeta"] {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const w = o.width;
  const h = o.height;
  // Rétrocompat brouillons sessionStorage : ancien champ `wasResized` accepté en lecture.
  const compressed =
    typeof o.wasCompressed === "boolean"
      ? o.wasCompressed
      : typeof o.wasResized === "boolean"
        ? o.wasResized
        : null;
  const fs = o.fileSizeBytes;
  if (
    typeof w === "number" &&
    Number.isFinite(w) &&
    w > 0 &&
    typeof h === "number" &&
    Number.isFinite(h) &&
    h > 0 &&
    compressed !== null &&
    typeof fs === "number" &&
    Number.isFinite(fs) &&
    fs >= 0
  ) {
    return {
      width: Math.floor(w),
      height: Math.floor(h),
      wasCompressed: compressed,
      fileSizeBytes: Math.floor(fs),
    };
  }
  return null;
}

function clampStep(step: number): number {
  if (step < 0) return 0;
  if (step >= TACHE_FORM_STEP_COUNT) return TACHE_FORM_STEP_COUNT - 1;
  return step;
}

const SLOT_ID_PATTERN = /^doc_\d+$/;
const LEGACY_SLOT_MAPPING: Record<string, DocumentSlotId> = {
  doc_A: "doc_1",
  doc_B: "doc_2",
  doc_C: "doc_3",
  doc_D: "doc_4",
};

function normalizeSlotKey(key: string): DocumentSlotId | null {
  if (SLOT_ID_PATTERN.test(key)) return key as DocumentSlotId;
  return LEGACY_SLOT_MAPPING[key] ?? null;
}

function isCleCase(v: unknown): v is CleCase {
  return typeof v === "string" && (TOUTES_LES_CASES as readonly string[]).includes(v);
}

function sanitizeCasesAssociees(raw: unknown): CleCase[] {
  if (!Array.isArray(raw)) return [];
  const out: CleCase[] = [];
  const seen = new Set<CleCase>();
  for (const v of raw) {
    if (isCleCase(v) && !seen.has(v)) {
      out.push(v);
      seen.add(v);
    }
  }
  return out;
}

function sanitizeCaseSchema(raw: unknown): { guidage: string; reponse: string } {
  if (!raw || typeof raw !== "object") return { guidage: "", reponse: "" };
  const o = raw as Record<string, unknown>;
  return {
    guidage: typeof o.guidage === "string" ? o.guidage : "",
    reponse: typeof o.reponse === "string" ? o.reponse : "",
  };
}

function sanitizeBlocSchema(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return {
      pivot: { guidage: "", reponse: "" },
      precision1: { guidage: "", reponse: "" },
      precision2: { guidage: "", reponse: "" },
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    pivot: sanitizeCaseSchema(o.pivot),
    precision1: sanitizeCaseSchema(o.precision1),
    precision2: sanitizeCaseSchema(o.precision2),
  };
}

function sanitizeSchemaCd1(raw: unknown): SchemaCd1Data | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    preambule: typeof o.preambule === "string" ? o.preambule : "",
    chapeauObjet: typeof o.chapeauObjet === "string" ? o.chapeauObjet : "",
    chapeauPeriode: typeof o.chapeauPeriode === "string" ? o.chapeauPeriode : "",
    caseObjet: sanitizeCaseSchema(o.caseObjet),
    blocA: sanitizeBlocSchema(o.blocA),
    blocB: sanitizeBlocSchema(o.blocB),
  };
}

function sanitizeDocumentsSlice(raw: unknown): Partial<Record<DocumentSlotId, DocumentSlotData>> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  for (const [key, slot] of Object.entries(raw as Record<string, unknown>)) {
    const id = normalizeSlotKey(key);
    if (!id) continue;
    if (!slot || typeof slot !== "object") continue;
    const s = slot as Partial<DocumentSlotData>;
    const base = emptyDocumentSlot();
    out[id] = {
      ...base,
      mode: s.mode === "idle" || s.mode === "create" || s.mode === "reuse" ? s.mode : base.mode,
      type: s.type === "iconographique" ? "iconographique" : "textuel",
      titre: typeof s.titre === "string" ? s.titre : "",
      contenu: typeof s.contenu === "string" ? s.contenu : "",
      source_citation: typeof s.source_citation === "string" ? s.source_citation : "",
      imageUrl: typeof s.imageUrl === "string" && s.imageUrl.length > 0 ? s.imageUrl : null,
      source_document_id:
        typeof s.source_document_id === "string" && s.source_document_id.length > 0
          ? s.source_document_id
          : null,
      source_version:
        typeof s.source_version === "number" && Number.isFinite(s.source_version)
          ? s.source_version
          : null,
      update_available: Boolean(s.update_available),
      reuse_author: typeof s.reuse_author === "string" ? s.reuse_author : "",
      reuse_source_citation:
        typeof s.reuse_source_citation === "string" ? s.reuse_source_citation : "",
      source_type:
        s.source_type === "primaire" || s.source_type === "secondaire" ? s.source_type : null,
      image_legende: typeof s.image_legende === "string" ? s.image_legende : "",
      image_legende_position:
        s.image_legende_position === "haut_gauche" ||
        s.image_legende_position === "haut_droite" ||
        s.image_legende_position === "bas_gauche" ||
        s.image_legende_position === "bas_droite"
          ? s.image_legende_position
          : null,
      imagePixelWidth:
        typeof s.imagePixelWidth === "number" &&
        Number.isInteger(s.imagePixelWidth) &&
        s.imagePixelWidth > 0
          ? s.imagePixelWidth
          : null,
      imagePixelHeight:
        typeof s.imagePixelHeight === "number" &&
        Number.isInteger(s.imagePixelHeight) &&
        s.imagePixelHeight > 0
          ? s.imagePixelHeight
          : null,
      imageUploadMeta: sanitizeImageUploadMeta(s.imageUploadMeta),
      repere_temporel: typeof s.repere_temporel === "string" ? s.repere_temporel : "",
      annee_normalisee:
        typeof s.annee_normalisee === "number" && Number.isFinite(s.annee_normalisee)
          ? Math.trunc(s.annee_normalisee)
          : null,
      type_iconographique: parseTypeIconographique(s.type_iconographique),
      estLeurre: Boolean(s.estLeurre),
      casesAssociees: sanitizeCasesAssociees(
        (s as Partial<DocumentSlotData> & { casesAssociees?: unknown }).casesAssociees,
      ),
    };
  }
  return out;
}

export function parseNonRedactionData(raw: unknown): NonRedactionData | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const t = o.type;
  if (t === "placeholder") return { type: "placeholder" };
  if (t === "ordre-chronologique" && "payload" in o) {
    const p = normalizeOrdreChronologiquePayload(o.payload);
    if (p) return { type: "ordre-chronologique", payload: p };
    return null;
  }
  if (t === "ligne-du-temps" && "payload" in o) {
    const p = normalizeLigneDuTempsPayload(o.payload);
    if (p) return { type: "ligne-du-temps", payload: p };
    return null;
  }
  if (t === "avant-apres" && "payload" in o) {
    const p = normalizeAvantApresPayload(o.payload);
    if (p) return { type: "avant-apres", payload: p };
    return null;
  }
  return null;
}

function sanitizeBloc5Slice(raw: unknown): Bloc5Slice {
  if (!raw || typeof raw !== "object") return initialBloc5;
  const b = raw as Record<string, unknown>;
  const corrige = typeof b.corrige === "string" ? b.corrige : "";
  const nr = parseNonRedactionData(b.nonRedaction);
  const intrus =
    b.intrus && typeof b.intrus === "object" ? (b.intrus as Bloc5Slice["intrus"]) : null;
  const notesCorrecteur = typeof b.notesCorrecteur === "string" ? b.notesCorrecteur : "";
  return { corrige, notesCorrecteur, nonRedaction: nr, intrus };
}

function sanitizeBloc7Slice(raw: unknown): Bloc7Slice {
  if (!raw || typeof raw !== "object" || raw === null) return { ...initialBloc7 };
  const b = raw as Record<string, unknown>;
  const aspects =
    b.aspects && typeof b.aspects === "object"
      ? { ...initialAspects, ...(b.aspects as Record<string, boolean>) }
      : { ...initialAspects };
  return {
    aspects,
    connaissances: sanitizeConnaissances(b.connaissances),
  };
}

/**
 * Brouillon stocké non vide sans `bloc1` valide — ancien format ou donnée corrompue : à signaler (toast).
 */
export function isWizardDraftObsoletePayload(raw: unknown): boolean {
  if (raw === null || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (Object.keys(o).length === 0) return false;
  if (typeof o.bloc1 === "object" && o.bloc1 !== null) return false;
  return true;
}

function hasAllBlocSlices(o: Record<string, unknown>): boolean {
  return (
    typeof o.bloc1 === "object" &&
    o.bloc1 !== null &&
    typeof o.bloc2 === "object" &&
    o.bloc2 !== null &&
    typeof o.bloc3 === "object" &&
    o.bloc3 !== null &&
    typeof o.bloc4 === "object" &&
    o.bloc4 !== null &&
    typeof o.bloc5 === "object" &&
    o.bloc5 !== null &&
    typeof o.bloc6 === "object" &&
    o.bloc6 !== null &&
    typeof o.bloc7 === "object" &&
    o.bloc7 !== null
  );
}

/** Restaure un état formulaire v7 depuis JSON stocké. Aucune lecture des clés `conception` / `redaction` / etc. */
export function sanitizeHydratedState(raw: unknown): TacheFormState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.currentStep !== "number" || !Number.isFinite(o.currentStep)) return null;
  if (!hasAllBlocSlices(o)) return null;

  const concIn = o.bloc1 as Partial<ConceptionSlice>;
  const rawMode = concIn.modeConception;
  const modeConception: ConceptionSlice["modeConception"] =
    rawMode === "seul" || rawMode === "equipe" || rawMode === "" ? rawMode : "";
  const bloc1: ConceptionSlice = {
    ...initialConception,
    ...concIn,
    modeConception,
    collaborateurs: Array.isArray(concIn.collaborateurs)
      ? concIn.collaborateurs.filter(
          (c): c is { id: string; displayName: string } =>
            Boolean(c && typeof c.id === "string" && typeof c.displayName === "string") &&
            isProfileCollaborateurId(c.id),
        )
      : [],
  };

  const rawDocumentSlots = Array.isArray((o.bloc2 as BlueprintSlice).documentSlots)
    ? (o.bloc2 as BlueprintSlice).documentSlots
    : [];
  const rawBloc2 =
    typeof o.bloc2 === "object" && o.bloc2 !== null ? (o.bloc2 as Record<string, unknown>) : {};
  const rawTypeTache = rawBloc2.typeTache;
  const typeTache: BlueprintSlice["typeTache"] =
    rawTypeTache === "section_a" || rawTypeTache === "section_b" || rawTypeTache === "section_c"
      ? rawTypeTache
      : "section_a";
  const isAspectKey = (v: unknown): v is BlueprintSlice["aspectA"] & string =>
    v === "economique" ||
    v === "politique" ||
    v === "social" ||
    v === "culturel" ||
    v === "territorial";
  const bloc2: BlueprintSlice = {
    ...initialBlueprint,
    ...rawBloc2,
    typeTache,
    aspectA: isAspectKey(rawBloc2.aspectA) ? rawBloc2.aspectA : null,
    aspectB: isAspectKey(rawBloc2.aspectB) ? rawBloc2.aspectB : null,
    documentSlots: rawDocumentSlots
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const sid = (s as { slotId?: unknown }).slotId;
        if (typeof sid !== "string") return null;
        const normalized = normalizeSlotKey(sid);
        return normalized ? { slotId: normalized } : null;
      })
      .filter((s): s is { slotId: DocumentSlotId } => s !== null),
  };

  const b3 = o.bloc3 as Record<string, unknown>;
  const rawPerspMode = b3.perspectivesMode;
  const hydratedSchema = sanitizeSchemaCd1(b3.schemaCd1);
  const bloc3 = {
    consigne: typeof b3.consigne === "string" ? b3.consigne : "",
    guidage: typeof b3.guidage === "string" ? b3.guidage : "",
    perspectivesMode: (rawPerspMode === "groupe" || rawPerspMode === "separe"
      ? rawPerspMode
      : null) as "groupe" | "separe" | null,
    perspectivesType:
      b3.perspectivesType === "historiens" ? ("historiens" as const) : ("acteurs" as const),
    perspectivesContexte:
      typeof b3.perspectivesContexte === "string" ? b3.perspectivesContexte : "",
    oi6Enjeu: typeof b3.oi6Enjeu === "string" ? b3.oi6Enjeu : "",
    oi7EnjeuGlobal: typeof b3.oi7EnjeuGlobal === "string" ? b3.oi7EnjeuGlobal : "",
    oi7Element1: typeof b3.oi7Element1 === "string" ? b3.oi7Element1 : "",
    oi7Element2: typeof b3.oi7Element2 === "string" ? b3.oi7Element2 : "",
    oi7Element3: typeof b3.oi7Element3 === "string" ? b3.oi7Element3 : "",
    consigneMode:
      b3.consigneMode === "personnalisee" ? ("personnalisee" as const) : ("gabarit" as const),
    // En Section B on garantit une structure minimale si absente (ancienne version du brouillon).
    schemaCd1: typeTache === "section_b" ? (hydratedSchema ?? SCHEMA_CD1_INITIAL) : hydratedSchema,
  };

  const b4 = o.bloc4 as { documents?: unknown };
  const documents = sanitizeDocumentsSlice(b4.documents);

  const bloc5 = sanitizeBloc5Slice(o.bloc5);

  const bloc6 = {
    cd: sanitizeCdFormSlice(
      typeof o.bloc6 === "object" && o.bloc6 !== null && "cd" in (o.bloc6 as object)
        ? (o.bloc6 as { cd?: unknown }).cd
        : undefined,
    ),
  };

  const bloc7 = sanitizeBloc7Slice(o.bloc7);

  return {
    currentStep: clampStep(o.currentStep),
    highestReachedStep: clampStep(
      typeof o.highestReachedStep === "number" && Number.isFinite(o.highestReachedStep)
        ? Math.max(o.highestReachedStep, o.currentStep)
        : o.currentStep,
    ),
    bloc1,
    bloc2,
    bloc3,
    bloc4: {
      documents,
      perspectives: null,
      perspectivesTitre: "",
      moments: null,
      momentsTitre: "",
    },
    bloc5,
    bloc6,
    bloc7,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parsePublishActionPayload(
  raw: unknown,
): { state: TacheFormState; editingTacheId: string | null } | null {
  if (raw && typeof raw === "object" && "state" in raw) {
    const o = raw as { state?: unknown; editingTacheId?: unknown };
    const state = sanitizeHydratedState(o.state);
    if (!state) return null;
    const ed = o.editingTacheId;
    if (ed === undefined || ed === null || ed === "") return { state, editingTacheId: null };
    if (typeof ed === "string" && UUID_RE.test(ed)) return { state, editingTacheId: ed };
    return null;
  }
  const state = sanitizeHydratedState(raw);
  if (!state) return null;
  return { state, editingTacheId: null };
}

export function serializeTacheFormState(state: TacheFormState): unknown {
  return JSON.parse(JSON.stringify(state)) as unknown;
}
