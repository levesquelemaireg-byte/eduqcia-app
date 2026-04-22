/**
 * État du wizard « Créer une tâche » — structure par blocs (behaviour-driven).
 * Le nombre d’étapes = `TAE_FORM_STEP_COUNT` (`components/tae/TaeForm/step-meta.ts`).
 */

import type { Dispatch } from "react";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import type { CdFormSlice, CdSelectionWithIds } from "@/lib/tache/cd-helpers";
import { initialCdFormSlice } from "@/lib/tache/cd-helpers";
import type { ConnaissanceSelectionWithIds } from "@/lib/tache/connaissances-helpers";
import {
  initialAspects,
  type AspectSocieteKey,
  type RedactionSlice,
} from "@/lib/tache/redaction-helpers";
import type {
  IntrusPayload,
  MomentData,
  PerspectiveData,
  PerspectiveLetter,
} from "@/lib/tache/oi-perspectives/perspectives-types";
import type { AvantApresPayload } from "@/lib/tache/non-redaction/avant-apres-payload";
import type { LigneDuTempsPayload } from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import type { OrdreChronologiquePayload } from "@/lib/tache/non-redaction/ordre-chronologique-payload";

/** Doit rester égal à `TAE_FORM_STEPS.length`. */
export const TAE_FORM_STEP_COUNT = 7;

export const TAE_CONCEPTION_STEP_INDEX = 0;
export const TAE_BLUEPRINT_STEP_INDEX = 1;
/** Bloc 3 — consigne (+ guidage selon comportement). */
export const TAE_REDACTION_STEP_INDEX = 2;
export const TAE_DOCUMENTS_STEP_INDEX = 3;
/** Bloc 5 — corrigé / options non-rédactionnelles. */
export const TAE_BLOC5_STEP_INDEX = 4;
/** Bloc 6 — compétence disciplinaire. */
export const TAE_CD_STEP_INDEX = 5;
/** Bloc 7 — aspects de société + connaissances. */
export const TAE_CONNAISSANCES_STEP_INDEX = 6;

export type BlueprintSlice = {
  niveau: string;
  discipline: string;
  oiId: string;
  comportementId: string;
  nbLignes: number | null;
  nbDocuments: number | null;
  outilEvaluation: string | null;
  documentSlots: { slotId: DocumentSlotId }[];
  blueprintLocked: boolean;
};

export type ConceptionSlice = {
  modeConception: "" | "seul" | "equipe";
  collaborateurs: { id: string; displayName: string }[];
};

export type Bloc3Slice = {
  consigne: string;
  guidage: string;
  perspectivesMode: "groupe" | "separe" | null;
  perspectivesType: "acteurs" | "historiens";
  perspectivesContexte: string;
  oi6Enjeu: string;
  oi7EnjeuGlobal: string;
  oi7Element1: string;
  oi7Element2: string;
  oi7Element3: string;
  consigneMode: "gabarit" | "personnalisee";
};

export type Bloc4Slice = {
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>;
  perspectives: PerspectiveData[] | null;
  perspectivesTitre: string;
  moments: MomentData[] | null;
  momentsTitre: string;
};

/**
 * Données non rédactionnelles au Bloc 5 — union discriminée (extensions futures).
 */
export type NonRedactionData =
  | { type: "placeholder" }
  | { type: "ordre-chronologique"; payload: OrdreChronologiquePayload }
  | { type: "ligne-du-temps"; payload: LigneDuTempsPayload }
  | { type: "avant-apres"; payload: AvantApresPayload };

export type Bloc5Slice = {
  corrige: string;
  /** Notes au correcteur — nuances, cas particuliers, pièges. Champ distinct du corrigé (spec §3.6). */
  notesCorrecteur: string;
  nonRedaction: NonRedactionData | null;
  intrus: IntrusPayload | null;
};

export type Bloc6Slice = {
  cd: CdFormSlice;
};

export type Bloc7Slice = {
  aspects: Record<AspectSocieteKey, boolean>;
  connaissances: ConnaissanceSelectionWithIds[];
};

export type TaeFormState = {
  currentStep: number;
  /** Étape la plus haute atteinte — permet la navigation libre en édition. */
  highestReachedStep: number;
  bloc1: ConceptionSlice;
  bloc2: BlueprintSlice;
  bloc3: Bloc3Slice;
  bloc4: Bloc4Slice;
  bloc5: Bloc5Slice;
  bloc6: Bloc6Slice;
  bloc7: Bloc7Slice;
};

export type Bloc5Props = {
  state: TaeFormState;
  dispatch: Dispatch<TaeFormAction>;
};

export type TaeFormAction =
  | { type: "HYDRATE"; state: TaeFormState }
  | { type: "SET_STEP"; step: number }
  | { type: "STEP_NEXT" }
  | { type: "STEP_PREV" }
  | { type: "SET_MODE_CONCEPTION"; mode: "seul" | "equipe" }
  | { type: "ADD_COLLABORATEUR"; id: string; displayName: string }
  | { type: "REMOVE_COLLABORATEUR"; id: string }
  | { type: "SET_NIVEAU"; niveau: string }
  | { type: "SET_DISCIPLINE"; discipline: string }
  | { type: "SET_OI"; oiId: string }
  | {
      type: "SET_COMPORTEMENT";
      comportementId: string;
      nbDocuments: number;
      outilEvaluation: string;
      nbLignes: number;
    }
  | { type: "LOCK_BLUEPRINT" }
  | { type: "UNLOCK_BLUEPRINT" }
  | { type: "SET_CONSIGNE"; value: string }
  | { type: "SET_ASPECT"; aspect: AspectSocieteKey; value: boolean }
  | { type: "SET_GUIDAGE"; value: string }
  | { type: "SET_CORRIGE"; value: string }
  | { type: "SET_NOTES_CORRECTEUR"; value: string }
  | {
      type: "UPDATE_DOCUMENT_SLOT";
      slotId: DocumentSlotId;
      patch: Partial<DocumentSlotData>;
    }
  | { type: "SET_CD_SELECTION"; selection: CdSelectionWithIds | null }
  | { type: "TOGGLE_CONNAISSANCE"; selection: ConnaissanceSelectionWithIds }
  | { type: "CLEAR_CONNAISSANCES" }
  | { type: "REMOVE_CONNAISSANCE_BY_ROW_ID"; rowId: string }
  | { type: "NON_REDACTION_PATCH_ORDRE_CHRONO"; patch: Partial<OrdreChronologiquePayload> }
  | { type: "NON_REDACTION_PATCH_LIGNE_TEMPS"; patch: Partial<LigneDuTempsPayload> }
  | { type: "NON_REDACTION_PATCH_AVANT_APRES"; patch: Partial<AvantApresPayload> }
  | { type: "SET_PERSPECTIVES_MODE_WITH_MIGRATION"; value: "groupe" | "separe"; count: 2 | 3 }
  | { type: "UPDATE_PERSPECTIVE"; index: number; patch: Partial<PerspectiveData> }
  | { type: "SET_PERSPECTIVES_TYPE"; value: "acteurs" | "historiens" }
  | { type: "SET_PERSPECTIVES_CONTEXTE"; value: string }
  | { type: "SET_PERSPECTIVES_TITRE"; value: string }
  | { type: "SET_OI6_ENJEU"; value: string }
  | { type: "SET_OI7_ENJEU_GLOBAL"; value: string }
  | { type: "SET_OI7_ELEMENT_1"; value: string }
  | { type: "SET_OI7_ELEMENT_2"; value: string }
  | { type: "SET_OI7_ELEMENT_3"; value: string }
  | { type: "SET_CONSIGNE_MODE"; value: "gabarit" | "personnalisee" }
  | { type: "UPDATE_MOMENT"; index: number; patch: Partial<MomentData> }
  | { type: "SET_MOMENTS_TITRE"; value: string }
  | { type: "SET_INTRUS_LETTER"; value: PerspectiveLetter | "" }
  | { type: "SET_INTRUS_EXPLICATION"; value: string }
  | { type: "SET_INTRUS_POINT_COMMUN"; value: string }
  | { type: "INJECT_DOCUMENT_SLOT_REPLACE"; slotId: DocumentSlotId; data: DocumentSlotData }
  | { type: "INJECT_DOCUMENT_SLOT_FIRST_EMPTY"; data: DocumentSlotData }
  | { type: "RESET_DRAFT_AND_INJECT_DOCUMENT"; data: DocumentSlotData };

export const initialBlueprint: BlueprintSlice = {
  niveau: "",
  discipline: "",
  oiId: "",
  comportementId: "",
  nbLignes: null,
  nbDocuments: null,
  outilEvaluation: null,
  documentSlots: [],
  blueprintLocked: false,
};

export const initialConception: ConceptionSlice = {
  modeConception: "",
  collaborateurs: [],
};

export const initialBloc3: Bloc3Slice = {
  consigne: "",
  guidage: "",
  perspectivesMode: null,
  perspectivesType: "acteurs",
  perspectivesContexte: "",
  oi6Enjeu: "",
  oi7EnjeuGlobal: "",
  oi7Element1: "",
  oi7Element2: "",
  oi7Element3: "",
  consigneMode: "gabarit",
};

export const initialBloc5: Bloc5Slice = {
  corrige: "",
  notesCorrecteur: "",
  nonRedaction: null,
  intrus: null,
};

export const initialBloc7: Bloc7Slice = {
  aspects: { ...initialAspects },
  connaissances: [],
};

export const initialTaeFormState: TaeFormState = {
  currentStep: 0,
  highestReachedStep: 0,
  bloc1: initialConception,
  bloc2: initialBlueprint,
  bloc3: initialBloc3,
  bloc4: {
    documents: {},
    perspectives: null,
    perspectivesTitre: "",
    moments: null,
    momentsTitre: "",
  },
  bloc5: initialBloc5,
  bloc6: { cd: initialCdFormSlice },
  bloc7: initialBloc7,
};

/** Vue agrégée pour aperçu / sommaire / helpers existants (`RedactionSlice`). */
export function getRedactionSliceForPreview(state: TaeFormState): RedactionSlice {
  return {
    consigne: state.bloc3.consigne,
    guidage: state.bloc3.guidage,
    corrige: state.bloc5.corrige,
    aspects: state.bloc7.aspects,
  };
}
