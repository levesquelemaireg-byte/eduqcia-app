import {
  hasCompleteOrdreOptionsOnly,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import { isDocumentsStepComplete } from "@/lib/tache/document-helpers";
import type { ComportementConfig } from "@/lib/tache/behaviours/types";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

function nonEmptyTheme(state: TacheFormState): boolean {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "ordre-chronologique") return false;
  const p = normalizeOrdreChronologiquePayload(nr.payload);
  return Boolean(p && p.consigneTheme.trim().length > 0);
}

function ordreOptionsComplete(state: TacheFormState): boolean {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "ordre-chronologique") return false;
  const p = normalizeOrdreChronologiquePayload(nr.payload);
  return p !== null && hasCompleteOrdreOptionsOnly(p);
}

function isBloc6Complete(state: TacheFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc === "geo") return true;
  const sel = state.bloc6.cd.selection;
  if (!sel) return false;
  return [sel.competence, sel.composante, sel.critere].every((s) => s.trim().length > 0);
}

function isBloc7Complete(state: TacheFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (!Object.values(state.bloc7.aspects).some(Boolean)) return false;
  if (disc === "geo") return true;
  return state.bloc7.connaissances.length >= 1;
}

export const ordreChronologiqueConfig: ComportementConfig = {
  slug: "ordre-chronologique",
  label: "Ordre chronologique",
  isRedactionnel: false,
  bloc3: { hasGuidage: true },
  bloc4: { documentCount: 4, requiresRepereTemporel: true },
  completionCriteria: {
    bloc3: (state) => nonEmptyTheme(state),
    bloc4: (state) => isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents),
    bloc5: (state) => ordreOptionsComplete(state),
    bloc6: (state) => isBloc6Complete(state),
    bloc7: (state) => isBloc7Complete(state),
  },
};
