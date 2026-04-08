import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { isBlueprintFieldsComplete, type DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { isDocumentsStepComplete } from "@/lib/tae/document-helpers";
import {
  isAvantApresPayloadCompleteForCdGate,
  normalizeAvantApresPayload,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import {
  isLigneDuTempsStep3Complete,
  isLigneDuTempsStep5SegmentComplete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import {
  isOrdreChronologiqueStep3Complete,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import { isRedactionSliceReadyForCdGate } from "@/lib/tae/redaction-helpers";
import { getRedactionSliceForPreview } from "@/lib/tae/tae-form-state-types";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tae/wizard-state-nr";

/** Géographie : pas de fichier CD — étape considérée complète sans sélection (BLOC5-CD.md §2). */
export function isCdStepComplete(state: TaeFormState): boolean {
  const disc = state.bloc2.discipline as DisciplineCode;
  if (disc === "geo") return true;
  const sel = state.bloc6.cd.selection;
  if (!sel) return false;
  return [sel.competence, sel.composante, sel.critere].every((s) => s.trim().length > 0);
}

/**
 * Accès étape 6 (compétence disciplinaire) : blueprint verrouillé, étape 3 et 4 cohérentes,
 * étape 5 (corrigé rédactionnel) si parcours rédactionnel — **sans** exiger les aspects (étape 7).
 */
export function isCdStepGateOk(state: TaeFormState): boolean {
  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  if (!blueprintGate) return false;
  if (!isDocumentsStepComplete(b.documentSlots, state.bloc4.documents)) return false;

  if (isActiveOrdreChronologiqueVariant(state)) {
    const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
    return p !== null && isOrdreChronologiqueStep3Complete(p);
  }
  if (isActiveLigneDuTempsVariant(state)) {
    const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
    return p !== null && isLigneDuTempsStep3Complete(p) && isLigneDuTempsStep5SegmentComplete(p);
  }
  if (isActiveAvantApresVariant(state)) {
    const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
    return p !== null && isAvantApresPayloadCompleteForCdGate(p);
  }
  return isRedactionSliceReadyForCdGate(getRedactionSliceForPreview(state));
}
