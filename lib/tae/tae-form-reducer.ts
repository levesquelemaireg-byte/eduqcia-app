import {
  disciplinesForNiveau,
  documentSlotsFromCount,
  type DisciplineCode,
  type NiveauCode,
} from "@/lib/tae/blueprint-helpers";
import { emptyDocumentSlot } from "@/lib/tae/document-helpers";
import { initialCdFormSlice, sanitizeCdFormSlice } from "@/lib/tae/cd-helpers";
import { sanitizeConnaissances } from "@/lib/tae/connaissances-helpers";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import {
  initialLigneDuTempsPayload,
  mergeLigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import {
  initialOrdreChronologiquePayload,
  mergeOrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import type { BlueprintSlice } from "@/lib/tae/tae-form-state-types";
import {
  initialBloc3,
  initialBloc5,
  initialBloc7,
  TAE_FORM_STEP_COUNT,
  type NonRedactionData,
  type TaeFormAction,
  type TaeFormState,
} from "@/lib/tae/tae-form-state-types";

function initialNonRedactionForSlug(
  slug: ReturnType<typeof getVariantSlugForComportementId>,
): NonRedactionData | null {
  if (slug === "ordre-chronologique") {
    return { type: "ordre-chronologique", payload: initialOrdreChronologiquePayload() };
  }
  if (slug === "ligne-du-temps") {
    return { type: "ligne-du-temps", payload: initialLigneDuTempsPayload() };
  }
  return null;
}

function clampStep(step: number): number {
  if (step < 0) return 0;
  if (step >= TAE_FORM_STEP_COUNT) return TAE_FORM_STEP_COUNT - 1;
  return step;
}

function clearComportementSlots(b: BlueprintSlice): BlueprintSlice {
  return {
    ...b,
    comportementId: "",
    nbDocuments: null,
    outilEvaluation: null,
    documentSlots: [],
    nbLignes: null,
  };
}

function clearOiAndComportement(b: BlueprintSlice): BlueprintSlice {
  return {
    ...clearComportementSlots(b),
    oiId: "",
  };
}

export function taeFormReducer(state: TaeFormState, action: TaeFormAction): TaeFormState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...action.state,
        bloc4: { documents: action.state.bloc4?.documents ?? {} },
        bloc6: { cd: sanitizeCdFormSlice(action.state.bloc6?.cd) },
        bloc7: {
          aspects: action.state.bloc7?.aspects ?? initialBloc7.aspects,
          connaissances: sanitizeConnaissances(action.state.bloc7?.connaissances),
        },
        bloc5: {
          corrige: action.state.bloc5?.corrige ?? "",
          nonRedaction: action.state.bloc5?.nonRedaction ?? null,
        },
      };
    case "SET_STEP":
      return { ...state, currentStep: clampStep(action.step) };
    case "STEP_NEXT":
      return { ...state, currentStep: clampStep(state.currentStep + 1) };
    case "STEP_PREV":
      return { ...state, currentStep: clampStep(state.currentStep - 1) };
    case "SET_MODE_CONCEPTION":
      return {
        ...state,
        bloc1: {
          ...state.bloc1,
          modeConception: action.mode,
          collaborateurs: action.mode === "seul" ? [] : state.bloc1.collaborateurs,
        },
      };
    case "ADD_COLLABORATEUR":
      return {
        ...state,
        bloc1: {
          ...state.bloc1,
          collaborateurs: [
            ...state.bloc1.collaborateurs.filter((c) => c.id !== action.id),
            { id: action.id, displayName: action.displayName },
          ],
        },
      };
    case "REMOVE_COLLABORATEUR":
      return {
        ...state,
        bloc1: {
          ...state.bloc1,
          collaborateurs: state.bloc1.collaborateurs.filter((c) => c.id !== action.id),
        },
      };
    case "SET_NIVEAU": {
      const opts = disciplinesForNiveau(action.niveau as NiveauCode);
      const prevD = state.bloc2.discipline;
      const nextDiscipline =
        opts.length === 1 ? opts[0]! : prevD && opts.includes(prevD as DisciplineCode) ? prevD : "";
      const disciplineChanged = prevD !== nextDiscipline;
      const b = clearOiAndComportement({
        ...state.bloc2,
        niveau: action.niveau,
        discipline: nextDiscipline,
      });
      return {
        ...state,
        bloc2: b,
        bloc3: disciplineChanged ? initialBloc3 : state.bloc3,
        bloc4: { documents: {} },
        bloc5: initialBloc5,
        bloc6: { cd: initialCdFormSlice },
        bloc7: { ...initialBloc7, connaissances: [] },
      };
    }
    case "SET_DISCIPLINE": {
      const disciplineChanged = state.bloc2.discipline !== action.discipline;
      const b = clearOiAndComportement({
        ...state.bloc2,
        discipline: action.discipline,
      });
      return {
        ...state,
        bloc2: b,
        bloc3: disciplineChanged ? initialBloc3 : state.bloc3,
        bloc4: { documents: {} },
        bloc5: initialBloc5,
        bloc6: { cd: initialCdFormSlice },
        bloc7: { ...initialBloc7, connaissances: [] },
      };
    }
    case "SET_OI": {
      const b = clearComportementSlots(state.bloc2);
      return {
        ...state,
        bloc2: {
          ...b,
          oiId: action.oiId,
        },
        bloc5: initialBloc5,
      };
    }
    case "SET_COMPORTEMENT": {
      const slug = getVariantSlugForComportementId(action.comportementId);
      const nonRedaction = initialNonRedactionForSlug(slug);
      return {
        ...state,
        bloc2: {
          ...state.bloc2,
          comportementId: action.comportementId,
          nbDocuments: action.nbDocuments,
          outilEvaluation: action.outilEvaluation,
          documentSlots: documentSlotsFromCount(action.nbDocuments),
          nbLignes: action.nbLignes,
        },
        bloc4: { documents: {} },
        bloc5: {
          corrige: state.bloc5.corrige,
          nonRedaction,
        },
        bloc3: { ...state.bloc3, guidage: "" },
      };
    }
    case "LOCK_BLUEPRINT":
      return {
        ...state,
        bloc2: { ...state.bloc2, blueprintLocked: true },
      };
    case "UNLOCK_BLUEPRINT":
      return {
        ...state,
        bloc2: { ...state.bloc2, blueprintLocked: false },
      };
    case "SET_CONSIGNE":
      return {
        ...state,
        bloc3: { ...state.bloc3, consigne: action.value },
      };
    case "SET_ASPECT":
      return {
        ...state,
        bloc7: {
          ...state.bloc7,
          aspects: { ...state.bloc7.aspects, [action.aspect]: action.value },
        },
      };
    case "SET_GUIDAGE":
      return {
        ...state,
        bloc3: { ...state.bloc3, guidage: action.value },
      };
    case "SET_CORRIGE":
      return {
        ...state,
        bloc5: { ...state.bloc5, corrige: action.value },
      };
    case "UPDATE_DOCUMENT_SLOT": {
      const prev = state.bloc4.documents[action.slotId] ?? emptyDocumentSlot();
      return {
        ...state,
        bloc4: {
          documents: {
            ...state.bloc4.documents,
            [action.slotId]: { ...prev, ...action.patch },
          },
        },
      };
    }
    case "SET_CD_SELECTION":
      return {
        ...state,
        bloc6: { cd: { selection: action.selection } },
      };
    case "TOGGLE_CONNAISSANCE": {
      const id = action.selection.rowId;
      const exists = state.bloc7.connaissances.some((c) => c.rowId === id);
      if (exists) {
        return {
          ...state,
          bloc7: {
            ...state.bloc7,
            connaissances: state.bloc7.connaissances.filter((c) => c.rowId !== id),
          },
        };
      }
      return {
        ...state,
        bloc7: {
          ...state.bloc7,
          connaissances: [...state.bloc7.connaissances, action.selection],
        },
      };
    }
    case "CLEAR_CONNAISSANCES":
      return { ...state, bloc7: { ...state.bloc7, connaissances: [] } };
    case "REMOVE_CONNAISSANCE_BY_ROW_ID":
      return {
        ...state,
        bloc7: {
          ...state.bloc7,
          connaissances: state.bloc7.connaissances.filter((c) => c.rowId !== action.rowId),
        },
      };
    case "NON_REDACTION_PATCH_ORDRE_CHRONO": {
      const nr = state.bloc5.nonRedaction;
      if (nr?.type !== "ordre-chronologique") return state;
      return {
        ...state,
        bloc5: {
          ...state.bloc5,
          nonRedaction: {
            type: "ordre-chronologique",
            payload: mergeOrdreChronologiquePayload(nr.payload, action.patch),
          },
        },
      };
    }
    case "NON_REDACTION_PATCH_LIGNE_TEMPS": {
      const nr = state.bloc5.nonRedaction;
      if (nr?.type !== "ligne-du-temps") return state;
      return {
        ...state,
        bloc5: {
          ...state.bloc5,
          nonRedaction: {
            type: "ligne-du-temps",
            payload: mergeLigneDuTempsPayload(nr.payload, action.patch),
          },
        },
      };
    }
    default:
      return state;
  }
}
