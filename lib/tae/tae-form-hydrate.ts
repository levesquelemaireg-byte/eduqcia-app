/**
 * Parse / assainissement du brouillon TAÉ (sessionStorage, serveur JSONB).
 * Forme **v7 uniquement** (`bloc1` … `bloc7`) — pas de migration depuis l’ancien schéma.
 * Partagé client / serveur — pas de `"use client"`.
 */

import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tae/document-helpers";
import { sanitizeCdFormSlice } from "@/lib/tae/cd-helpers";
import { sanitizeConnaissances } from "@/lib/tae/connaissances-helpers";
import { normalizeAvantApresPayload } from "@/lib/tae/non-redaction/avant-apres-payload";
import { normalizeLigneDuTempsPayload } from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import { normalizeOrdreChronologiquePayload } from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import { initialAspects } from "@/lib/tae/redaction-helpers";
import { isProfileCollaborateurId } from "@/lib/tae/collaborateur-user-ids";
import {
  TAE_FORM_STEP_COUNT,
  initialBlueprint,
  initialBloc5,
  initialBloc7,
  initialConception,
  type BlueprintSlice,
  type Bloc5Slice,
  type Bloc7Slice,
  type ConceptionSlice,
  type NonRedactionData,
  type TaeFormState,
} from "@/lib/tae/tae-form-state-types";

function sanitizeImageUploadMeta(raw: unknown): DocumentSlotData["imageUploadMeta"] {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const w = o.width;
  const h = o.height;
  const wr = o.wasResized;
  const fs = o.fileSizeBytes;
  if (
    typeof w === "number" &&
    Number.isFinite(w) &&
    w > 0 &&
    typeof h === "number" &&
    Number.isFinite(h) &&
    h > 0 &&
    typeof wr === "boolean" &&
    typeof fs === "number" &&
    Number.isFinite(fs) &&
    fs >= 0
  ) {
    return {
      width: Math.floor(w),
      height: Math.floor(h),
      wasResized: wr,
      fileSizeBytes: Math.floor(fs),
    };
  }
  return null;
}

function clampStep(step: number): number {
  if (step < 0) return 0;
  if (step >= TAE_FORM_STEP_COUNT) return TAE_FORM_STEP_COUNT - 1;
  return step;
}

function sanitizeDocumentsSlice(raw: unknown): Partial<Record<DocumentSlotId, DocumentSlotData>> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<Record<DocumentSlotId, DocumentSlotData>> = {};
  const ids: DocumentSlotId[] = ["doc_A", "doc_B", "doc_C", "doc_D"];
  for (const id of ids) {
    const slot = (raw as Record<string, unknown>)[id];
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
      printImpressionScale: 1,
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
    b.intrus && typeof b.intrus === "object"
      ? (b.intrus as Bloc5Slice["intrus"])
      : null;
  return { corrige, nonRedaction: nr, intrus };
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
export function sanitizeHydratedState(raw: unknown): TaeFormState | null {
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

  const bloc2: BlueprintSlice = {
    ...initialBlueprint,
    ...(typeof o.bloc2 === "object" && o.bloc2 !== null ? o.bloc2 : {}),
    documentSlots: Array.isArray((o.bloc2 as BlueprintSlice).documentSlots)
      ? (o.bloc2 as BlueprintSlice).documentSlots.filter((s): s is { slotId: DocumentSlotId } =>
          Boolean(
            s && typeof s === "object" && typeof (s as { slotId?: unknown }).slotId === "string",
          ),
        )
      : [],
  };

  const b3 = o.bloc3 as Record<string, unknown>;
  const rawPerspMode = b3.perspectivesMode;
  const bloc3 = {
    consigne: typeof b3.consigne === "string" ? b3.consigne : "",
    guidage: typeof b3.guidage === "string" ? b3.guidage : "",
    perspectivesMode: (
      rawPerspMode === "groupe" || rawPerspMode === "separe" ? rawPerspMode : null
    ) as "groupe" | "separe" | null,
    perspectivesType: b3.perspectivesType === "historiens" ? "historiens" as const : "acteurs" as const,
    perspectivesContexte: typeof b3.perspectivesContexte === "string" ? b3.perspectivesContexte : "",
    oi6Enjeu: typeof b3.oi6Enjeu === "string" ? b3.oi6Enjeu : "",
    oi7EnjeuGlobal: typeof b3.oi7EnjeuGlobal === "string" ? b3.oi7EnjeuGlobal : "",
    oi7Element1: typeof b3.oi7Element1 === "string" ? b3.oi7Element1 : "",
    oi7Element2: typeof b3.oi7Element2 === "string" ? b3.oi7Element2 : "",
    oi7Element3: typeof b3.oi7Element3 === "string" ? b3.oi7Element3 : "",
    consigneMode: b3.consigneMode === "personnalisee" ? "personnalisee" as const : "gabarit" as const,
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
    bloc1,
    bloc2,
    bloc3,
    bloc4: { documents, perspectives: null, perspectivesTitre: "", moments: null, momentsTitre: "" },
    bloc5,
    bloc6,
    bloc7,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parsePublishActionPayload(
  raw: unknown,
): { state: TaeFormState; editingTaeId: string | null } | null {
  if (raw && typeof raw === "object" && "state" in raw) {
    const o = raw as { state?: unknown; editingTaeId?: unknown };
    const state = sanitizeHydratedState(o.state);
    if (!state) return null;
    const ed = o.editingTaeId;
    if (ed === undefined || ed === null || ed === "") return { state, editingTaeId: null };
    if (typeof ed === "string" && UUID_RE.test(ed)) return { state, editingTaeId: ed };
    return null;
  }
  const state = sanitizeHydratedState(raw);
  if (!state) return null;
  return { state, editingTaeId: null };
}

export function serializeTaeFormState(state: TaeFormState): unknown {
  return JSON.parse(JSON.stringify(state)) as unknown;
}
