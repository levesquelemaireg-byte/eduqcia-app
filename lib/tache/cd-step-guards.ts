import type { TaeFormState } from "@/lib/tache/tae-form-state-types";
import { isBlueprintFieldsComplete, type DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { isDocumentsStepComplete } from "@/lib/tache/document-helpers";
import {
  isAvantApresPayloadCompleteForCdGate,
  normalizeAvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  isLigneDuTempsStep3Complete,
  isLigneDuTempsStep5SegmentComplete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  isOrdreChronologiqueStep3Complete,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tache/non-redaction/wizard-variant";
import {
  isPerspectivesStepComplete,
  isMomentsStepComplete,
} from "@/lib/tache/oi-perspectives/perspectives-helpers";
import { isRedactionSliceReadyForCdGate } from "@/lib/tache/redaction-helpers";
import { getRedactionSliceForPreview } from "@/lib/tache/tae-form-state-types";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tache/wizard-state-nr";

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

  // Perspectives groupé (OI3 · 3.3/3.4/3.5) et moments groupé (OI6 · 6.3) stockent les
  // données dans bloc4.perspectives / bloc4.moments, pas dans bloc4.documents.
  // En mode séparé, les DocumentSlotPanel peuplent bloc4.documents normalement.
  const blocConfig = getWizardBlocConfig(b.comportementId);
  if (blocConfig?.bloc4.type === "perspectives" && state.bloc3.perspectivesMode === "groupe") {
    if (
      !isPerspectivesStepComplete(
        state.bloc4.perspectives,
        blocConfig.bloc4.count,
        state.bloc4.perspectivesTitre,
      )
    )
      return false;
  } else if (blocConfig?.bloc4.type === "moments") {
    if (!isMomentsStepComplete(state.bloc4.moments, 2, state.bloc4.momentsTitre)) return false;
  } else {
    if (!isDocumentsStepComplete(b.documentSlots, state.bloc4.documents)) return false;
  }

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
