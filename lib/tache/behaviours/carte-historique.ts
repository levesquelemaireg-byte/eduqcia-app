import type { ComportementConfig } from "@/lib/tache/behaviours/types";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import {
  isCarteHistoriqueDocumentsStepComplete,
  isCarteHistoriqueStep3Complete,
  isCarteHistoriqueStep5Complete,
  normalizeCarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

function payloadFromState(state: TacheFormState) {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "carte-historique") return null;
  return normalizeCarteHistoriquePayload(nr.payload);
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

export const carteHistoriqueConfig: ComportementConfig = {
  slug: "carte-historique",
  label: "Carte historique",
  isRedactionnel: false,
  bloc3: { hasGuidage: true },
  bloc4: { documentCount: 1, requiresRepereTemporel: true },
  completionCriteria: {
    bloc3: (state) => {
      const p = payloadFromState(state);
      return p !== null && isCarteHistoriqueStep3Complete(p);
    },
    bloc4: (state) =>
      isCarteHistoriqueDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents),
    bloc5: (state) => {
      const p = payloadFromState(state);
      return p !== null && isCarteHistoriqueStep5Complete(p);
    },
    bloc6: (state) => isBloc6Complete(state),
    bloc7: (state) => isBloc7Complete(state),
  },
};
