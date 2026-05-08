import type { ComportementConfig } from "@/lib/tache/behaviours/types";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import {
  isManifestationsDocumentsStepComplete,
  isManifestationsStep3Complete,
  isManifestationsStep5Complete,
  normalizeManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

function payloadFromState(state: TacheFormState) {
  const nr = state.bloc5.nonRedaction;
  if (nr?.type !== "manifestations") return null;
  return normalizeManifestationsPayload(nr.payload);
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
 * `documentCount` est dynamique : 2 pour 5.1, 4 pour 5.2.
 * La valeur effective est résolue au runtime depuis `state.bloc2.comportementId`
 * (cf. `lib/tache/blueprint-helpers.ts`). Cette config porte `null` car le compte
 * dépend du comportement, pas du slug seul.
 */
export const manifestationsConfig: ComportementConfig = {
  slug: "manifestations",
  label: "Manifestations",
  isRedactionnel: false,
  bloc3: { hasGuidage: true },
  bloc4: { documentCount: null, requiresRepereTemporel: false },
  completionCriteria: {
    bloc3: (state) => {
      const p = payloadFromState(state);
      return p !== null && isManifestationsStep3Complete(p);
    },
    bloc4: (state) =>
      isManifestationsDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents),
    bloc5: (state) => {
      const p = payloadFromState(state);
      return p !== null && isManifestationsStep5Complete(p);
    },
    bloc6: (state) => isBloc6Complete(state),
    bloc7: (state) => isBloc7Complete(state),
  },
};
