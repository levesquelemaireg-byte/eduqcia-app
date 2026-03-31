import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { isBlueprintFieldsComplete, type DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { isDocumentsStepComplete } from "@/lib/tae/document-helpers";
import { isRedactionStepComplete } from "@/lib/tae/redaction-helpers";
import { getRedactionSliceForPreview } from "@/lib/tae/tae-form-state-types";

/** Géographie : pas de fichier CD — étape considérée complète sans sélection (BLOC5-CD.md §2). */
export function isCdStepComplete(state: TaeFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc === "geo") return true;
  const sel = state.bloc6.cd.selection;
  if (!sel) return false;
  return [sel.competence, sel.composante, sel.critere].every((s) => s.trim().length > 0);
}

/** Accès au Bloc 5 : même prérequis que le Bloc 4 (blueprint verrouillé, rédaction, documents). */
export function isCdStepGateOk(state: TaeFormState): boolean {
  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  if (!blueprintGate || !isRedactionStepComplete(getRedactionSliceForPreview(state))) return false;
  return isDocumentsStepComplete(b.documentSlots, state.bloc4.documents);
}
