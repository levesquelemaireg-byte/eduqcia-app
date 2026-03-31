import { isDocumentsStepComplete } from "@/lib/tae/document-helpers";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import type { ComportementConfig } from "@/lib/tae/behaviours/types";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";

function isBloc6Complete(state: TaeFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc === "geo") return true;
  const sel = state.bloc6.cd.selection;
  if (!sel) return false;
  return [sel.competence, sel.composante, sel.critere].every((s) => s.trim().length > 0);
}

function isBloc7Complete(state: TaeFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (!Object.values(state.bloc7.aspects).some(Boolean)) return false;
  if (disc === "geo") return true;
  return state.bloc7.connaissances.length >= 1;
}

export const redactionnelConfig: ComportementConfig = {
  slug: "redactionnel",
  label: "Rédactionnel",
  isRedactionnel: true,
  bloc3: { hasGuidage: true },
  bloc4: { documentCount: null, requiresRepereTemporel: true },
  completionCriteria: {
    bloc3: (state) => htmlHasMeaningfulText(state.bloc3.consigne),
    bloc4: (state) => isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents),
    bloc5: (state) => htmlHasMeaningfulText(state.bloc5.corrige),
    bloc6: (state) => isBloc6Complete(state),
    bloc7: (state) => isBloc7Complete(state),
  },
};
