import {
  disciplinesForNiveau,
  documentSlotsFromCount,
  type DisciplineCode,
  type DocumentSlotId,
  type NiveauCode,
} from "@/lib/tache/blueprint-helpers";
import { emptyDocumentSlot } from "@/lib/tache/document-helpers";
import { handlePerspectivesModeWithMigration } from "@/lib/tache/reducer-perspectives";
import { sanitizeCdFormSlice } from "@/lib/tache/cd-helpers";
import { sanitizeConnaissances } from "@/lib/tache/connaissances-helpers";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import { reinitialiserBlocsEnAval } from "@/lib/tache/reinitialiser-blocs-en-aval";
import {
  initialAvantApresPayload,
  mergeAvantApresPayload,
  clearedAvantApresOptionsPatch,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  initialLigneDuTempsPayload,
  mergeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  initialOrdreChronologiquePayload,
  mergeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import type { BlueprintSlice } from "@/lib/tache/tache-form-state-types";
import {
  initialBloc5,
  initialBloc7,
  initialTacheFormState,
  TACHE_FORM_STEP_COUNT,
  type NonRedactionData,
  type TacheFormAction,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";

function initialNonRedactionForSlug(
  slug: ReturnType<typeof getVariantSlugForComportementId>,
): NonRedactionData | null {
  if (slug === "ordre-chronologique") {
    return { type: "ordre-chronologique", payload: initialOrdreChronologiquePayload() };
  }
  if (slug === "ligne-du-temps") {
    return { type: "ligne-du-temps", payload: initialLigneDuTempsPayload() };
  }
  if (slug === "avant-apres") {
    return { type: "avant-apres", payload: initialAvantApresPayload() };
  }
  return null;
}

function clampStep(step: number): number {
  if (step < 0) return 0;
  if (step >= TACHE_FORM_STEP_COUNT) return TACHE_FORM_STEP_COUNT - 1;
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

export function tacheFormReducer(state: TacheFormState, action: TacheFormAction): TacheFormState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...action.state,
        highestReachedStep: Math.max(
          action.state.highestReachedStep ?? 0,
          action.state.currentStep ?? 0,
        ),
        bloc4: {
          documents: action.state.bloc4?.documents ?? {},
          perspectives: action.state.bloc4?.perspectives ?? null,
          perspectivesTitre: action.state.bloc4?.perspectivesTitre ?? "",
          moments: action.state.bloc4?.moments ?? null,
          momentsTitre: action.state.bloc4?.momentsTitre ?? "",
        },
        bloc6: { cd: sanitizeCdFormSlice(action.state.bloc6?.cd) },
        bloc7: {
          aspects: action.state.bloc7?.aspects ?? initialBloc7.aspects,
          connaissances: sanitizeConnaissances(action.state.bloc7?.connaissances),
        },
        bloc5: {
          corrige: action.state.bloc5?.corrige ?? "",
          notesCorrecteur: action.state.bloc5?.notesCorrecteur ?? "",
          nonRedaction: action.state.bloc5?.nonRedaction ?? null,
          intrus: action.state.bloc5?.intrus ?? null,
        },
      };
    case "SET_STEP": {
      const next = clampStep(action.step);
      return {
        ...state,
        currentStep: next,
        highestReachedStep: Math.max(state.highestReachedStep, next),
      };
    }
    case "STEP_NEXT": {
      const next = clampStep(state.currentStep + 1);
      return {
        ...state,
        currentStep: next,
        highestReachedStep: Math.max(state.highestReachedStep, next),
      };
    }
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
      const b = clearOiAndComportement({
        ...state.bloc2,
        niveau: action.niveau,
        discipline: nextDiscipline,
        typeTache: "section_a" as const,
        aspectA: null,
        aspectB: null,
      });
      return {
        ...state,
        bloc2: b,
        ...reinitialiserBlocsEnAval(state),
      };
    }
    case "SET_DISCIPLINE": {
      const b = clearOiAndComportement({
        ...state.bloc2,
        discipline: action.discipline,
        typeTache: "section_a" as const,
        aspectA: null,
        aspectB: null,
      });
      return {
        ...state,
        bloc2: b,
        ...reinitialiserBlocsEnAval(state),
      };
    }
    case "SET_TYPE_TACHE": {
      if (state.bloc2.blueprintLocked) return state;

      const typeTache = action.value;
      const parcours = resoudreParcours(typeTache);

      if (!parcours.actif) return state;

      const oiId = parcours.oiAutoAssignee ? (parcours.oiIdFixe ?? "") : "";
      const comportementId = parcours.comportementAutoAssigne
        ? (parcours.comportementIdFixe ?? "")
        : "";
      const nbDocuments = parcours.oiAutoAssignee ? parcours.documentsMin : null;
      const documentSlots = nbDocuments ? documentSlotsFromCount(nbDocuments) : [];
      const outilEvaluation = parcours.grilleFixe ?? null;
      const nbLignes = parcours.oiAutoAssignee ? 0 : null;

      return {
        ...state,
        bloc2: {
          ...state.bloc2,
          typeTache,
          oiId,
          comportementId,
          nbDocuments,
          nbLignes,
          outilEvaluation,
          documentSlots,
          aspectA: null,
          aspectB: null,
        },
        ...reinitialiserBlocsEnAval(state),
      };
    }
    case "SET_ASPECT_A": {
      if (state.bloc2.blueprintLocked) return state;
      if (action.value && action.value === state.bloc2.aspectB) return state;
      return {
        ...state,
        bloc2: { ...state.bloc2, aspectA: action.value },
        ...reinitialiserBlocsEnAval(state),
      };
    }
    case "SET_ASPECT_B": {
      if (state.bloc2.blueprintLocked) return state;
      if (action.value && action.value === state.bloc2.aspectA) return state;
      return {
        ...state,
        bloc2: { ...state.bloc2, aspectB: action.value },
        ...reinitialiserBlocsEnAval(state),
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
        ...reinitialiserBlocsEnAval(state),
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
        ...reinitialiserBlocsEnAval(state),
        bloc5: { ...initialBloc5, nonRedaction },
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
    case "SET_NOTES_CORRECTEUR":
      return {
        ...state,
        bloc5: { ...state.bloc5, notesCorrecteur: action.value },
      };
    case "UPDATE_DOCUMENT_SLOT": {
      const prev = state.bloc4.documents[action.slotId] ?? emptyDocumentSlot();
      const nr = state.bloc5.nonRedaction;
      let bloc5 = state.bloc5;
      if (nr?.type === "avant-apres" && nr.payload.generated) {
        bloc5 = {
          ...state.bloc5,
          nonRedaction: {
            type: "avant-apres",
            payload: mergeAvantApresPayload(nr.payload, clearedAvantApresOptionsPatch()),
          },
        };
      }
      return {
        ...state,
        bloc4: {
          documents: {
            ...state.bloc4.documents,
            [action.slotId]: { ...prev, ...action.patch },
          },
          perspectives: state.bloc4.perspectives,
          perspectivesTitre: state.bloc4.perspectivesTitre,
          moments: state.bloc4.moments,
          momentsTitre: state.bloc4.momentsTitre,
        },
        bloc5,
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
    case "NON_REDACTION_PATCH_AVANT_APRES": {
      const nr = state.bloc5.nonRedaction;
      if (nr?.type !== "avant-apres") return state;
      return {
        ...state,
        bloc5: {
          ...state.bloc5,
          nonRedaction: {
            type: "avant-apres",
            payload: mergeAvantApresPayload(nr.payload, action.patch),
          },
        },
      };
    }
    case "SET_OI6_ENJEU":
      return { ...state, bloc3: { ...state.bloc3, oi6Enjeu: action.value } };
    case "SET_OI7_ENJEU_GLOBAL":
      return { ...state, bloc3: { ...state.bloc3, oi7EnjeuGlobal: action.value } };
    case "SET_OI7_ELEMENT_1":
      return { ...state, bloc3: { ...state.bloc3, oi7Element1: action.value } };
    case "SET_OI7_ELEMENT_2":
      return { ...state, bloc3: { ...state.bloc3, oi7Element2: action.value } };
    case "SET_OI7_ELEMENT_3":
      return { ...state, bloc3: { ...state.bloc3, oi7Element3: action.value } };
    case "SET_CONSIGNE_MODE":
      return { ...state, bloc3: { ...state.bloc3, consigneMode: action.value } };
    case "SET_PERSPECTIVES_TYPE":
      return { ...state, bloc3: { ...state.bloc3, perspectivesType: action.value } };
    case "SET_PERSPECTIVES_CONTEXTE":
      return { ...state, bloc3: { ...state.bloc3, perspectivesContexte: action.value } };
    case "SET_PERSPECTIVES_TITRE":
      return { ...state, bloc4: { ...state.bloc4, perspectivesTitre: action.value } };
    case "UPDATE_PERSPECTIVE": {
      const prev = state.bloc4.perspectives;
      if (!prev) return state;
      const updated = prev.map((p, i) => (i === action.index ? { ...p, ...action.patch } : p));
      return {
        ...state,
        bloc4: { ...state.bloc4, perspectives: updated },
      };
    }
    case "UPDATE_MOMENT": {
      const prev = state.bloc4.moments;
      if (!prev) return state;
      const updated = prev.map((m, i) => (i === action.index ? { ...m, ...action.patch } : m));
      return { ...state, bloc4: { ...state.bloc4, moments: updated } };
    }
    case "SET_MOMENTS_TITRE":
      return { ...state, bloc4: { ...state.bloc4, momentsTitre: action.value } };
    case "SET_INTRUS_LETTER": {
      const prev = state.bloc5.intrus ?? {
        intrusLetter: "",
        explicationDifference: "",
        pointCommun: "",
      };
      return {
        ...state,
        bloc5: { ...state.bloc5, intrus: { ...prev, intrusLetter: action.value } },
      };
    }
    case "SET_INTRUS_EXPLICATION": {
      const prev = state.bloc5.intrus ?? {
        intrusLetter: "",
        explicationDifference: "",
        pointCommun: "",
      };
      return {
        ...state,
        bloc5: { ...state.bloc5, intrus: { ...prev, explicationDifference: action.value } },
      };
    }
    case "SET_INTRUS_POINT_COMMUN": {
      const prev = state.bloc5.intrus ?? {
        intrusLetter: "",
        explicationDifference: "",
        pointCommun: "",
      };
      return {
        ...state,
        bloc5: { ...state.bloc5, intrus: { ...prev, pointCommun: action.value } },
      };
    }
    case "SET_PERSPECTIVES_MODE_WITH_MIGRATION":
      return handlePerspectivesModeWithMigration(state, action);
    case "INJECT_DOCUMENT_SLOT_REPLACE": {
      return {
        ...state,
        currentStep: 3,
        highestReachedStep: Math.max(state.highestReachedStep, 3),
        bloc4: {
          ...state.bloc4,
          documents: {
            ...state.bloc4.documents,
            [action.slotId]: action.data,
          },
        },
      };
    }
    case "INJECT_DOCUMENT_SLOT_FIRST_EMPTY": {
      const slots = state.bloc2.documentSlots;
      let targetSlotId: string | null = null;
      for (const { slotId } of slots) {
        const existing = state.bloc4.documents[slotId];
        if (!existing || existing.mode === "idle") {
          targetSlotId = slotId;
          break;
        }
      }
      if (!targetSlotId) return state;
      return {
        ...state,
        currentStep: 3,
        highestReachedStep: Math.max(state.highestReachedStep, 3),
        bloc4: {
          ...state.bloc4,
          documents: {
            ...state.bloc4.documents,
            [targetSlotId]: action.data,
          },
        },
      };
    }
    case "RESET_DRAFT_AND_INJECT_DOCUMENT": {
      return {
        ...initialTacheFormState,
        bloc4: {
          ...initialTacheFormState.bloc4,
          documents: { doc_1: action.data },
        },
      };
    }
    case "ADD_DOCUMENT_SLOT": {
      const parcours = resoudreParcours(state.bloc2.typeTache);
      const currentCount = state.bloc2.documentSlots.length;
      if (currentCount >= parcours.documentsMax) return state;
      const newSlotId = `doc_${currentCount + 1}` as DocumentSlotId;
      return {
        ...state,
        bloc2: {
          ...state.bloc2,
          documentSlots: [...state.bloc2.documentSlots, { slotId: newSlotId }],
          nbDocuments: currentCount + 1,
        },
      };
    }
    default:
      return state;
  }
}
