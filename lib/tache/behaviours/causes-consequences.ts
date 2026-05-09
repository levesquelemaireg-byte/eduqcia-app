import type { ComportementConfig } from "@/lib/tache/behaviours/types";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import {
  isCausesConsequencesDocumentsStepComplete,
  isCausesConsequencesStep3Complete,
  isCausesConsequencesStep5Complete,
  normalizeCausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

function payloadFromState(state: TacheFormState) {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "causes-consequences") return null;
  return normalizeCausesConsequencesPayload(nr.payload);
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

/**
 * `documentCount: 2` est invariant : 4.3 et 4.4 ont toujours exactement 2 documents.
 * `requiresRepereTemporel: false` — l'enseignant peut l'ajouter pour l'indexation
 * mais ce n'est pas obligatoire.
 */
export const causesConsequencesConfig: ComportementConfig = {
  slug: "causes-consequences",
  label: "Causes et conséquences",
  isRedactionnel: false,
  bloc3: { hasGuidage: true },
  bloc4: { documentCount: 2, requiresRepereTemporel: false },
  completionCriteria: {
    bloc3: (state) => {
      const p = payloadFromState(state);
      return p !== null && isCausesConsequencesStep3Complete(p);
    },
    bloc4: (state) =>
      isCausesConsequencesDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents),
    bloc5: (state) => {
      const p = payloadFromState(state);
      return p !== null && isCausesConsequencesStep5Complete(p);
    },
    bloc6: (state) => isBloc6Complete(state),
    bloc7: (state) => isBloc7Complete(state),
  },
};
