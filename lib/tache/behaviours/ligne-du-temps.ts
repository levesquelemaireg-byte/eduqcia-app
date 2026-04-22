import {
  isLigneDuTempsCorrectLetterValid,
  ligneDuTempsBoundariesNumericComplete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import { isDocumentsStepComplete } from "@/lib/tache/document-helpers";
import type { ComportementConfig } from "@/lib/tache/behaviours/types";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

function lignePayload(state: TacheFormState) {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "ligne-du-temps") return null;
  return normalizeLigneDuTempsPayload(nr.payload);
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

export const ligneDuTempsConfig: ComportementConfig = {
  slug: "ligne-du-temps",
  label: "Ligne du temps",
  isRedactionnel: false,
  bloc3: { hasGuidage: true },
  bloc4: { documentCount: 1, requiresRepereTemporel: false },
  completionCriteria: {
    bloc3: (state) => {
      const p = lignePayload(state);
      return p !== null && ligneDuTempsBoundariesNumericComplete(p);
    },
    bloc4: (state) => isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents),
    bloc5: (state) => {
      const p = lignePayload(state);
      return p !== null && isLigneDuTempsCorrectLetterValid(p);
    },
    bloc6: (state) => isBloc6Complete(state),
    bloc7: (state) => isBloc7Complete(state),
  },
};
