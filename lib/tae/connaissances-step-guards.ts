import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { isCdStepComplete, isCdStepGateOk } from "@/lib/tae/cd-step-guards";

/** Accès Bloc 6 : même base que Bloc 5 + étape compétence disciplinaire complète. */
export function isConnaissancesStepGateOk(state: TaeFormState): boolean {
  if (!isCdStepGateOk(state)) return false;
  return isCdStepComplete(state);
}

/**
 * Au moins une connaissance pour HEC/HQC. Géographie : pas de fichier (comme CD) — étape complète sans sélection.
 */
export function isConnaissancesStepComplete(state: TaeFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc === "geo") return true;
  return state.bloc7.connaissances.length >= 1;
}
