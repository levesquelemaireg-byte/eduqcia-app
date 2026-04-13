/**
 * Publication d’une TAÉ — prérequis métier (docs/FEATURES.md, docs/WORKFLOWS.md).
 */

import { isProfileCollaborateurId } from "@/lib/tae/collaborateur-user-ids";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import { isCdStepComplete } from "@/lib/tae/cd-step-guards";
import { isConnaissancesStepComplete } from "@/lib/tae/connaissances-step-guards";
import {
  isDocumentsCompleteButNotPublishable,
  isDocumentsStepPublishable,
} from "@/lib/tae/document-helpers";
import {
  isPerspectivesStepComplete,
  isMomentsStepComplete,
} from "@/lib/tae/oi-perspectives/perspectives-helpers";
import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
import {
  isAvantApresDocumentsPublishable,
  isAvantApresDocumentsStepComplete,
  isAvantApresPayloadConsistentWithDocuments,
  normalizeAvantApresPayload,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import {
  isLigneDuTempsStep3Complete,
  isLigneDuTempsStep5SegmentComplete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import {
  isOrdreChronologiqueDocumentsPublishable,
  isOrdreChronologiqueDocumentsStepComplete,
  isOrdreChronologiqueStep3Complete,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import { isRedactionStepComplete } from "@/lib/tae/redaction-helpers";
import { getRedactionSliceForPreview } from "@/lib/tae/tae-form-state-types";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tae/wizard-state-nr";

/** Même règle que `FormState.isConceptionStepComplete` — évite d’importer le module client depuis `lib/`. */
function conceptionOkForPublish(c: TaeFormState["bloc1"]): boolean {
  if (c.modeConception === "seul") return true;
  if (c.modeConception === "equipe") {
    if (c.collaborateurs.length < 1) return false;
    return c.collaborateurs.every((x) => isProfileCollaborateurId(x.id));
  }
  return false;
}

function redactionStepOkForPublish(state: TaeFormState): boolean {
  if (isActiveOrdreChronologiqueVariant(state)) {
    const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
    return p !== null && isOrdreChronologiqueStep3Complete(p);
  }
  if (isActiveLigneDuTempsVariant(state)) {
    const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
    return p !== null && isLigneDuTempsStep3Complete(p);
  }
  return isRedactionStepComplete(getRedactionSliceForPreview(state));
}

function documentsStepOkForPublish(state: TaeFormState): boolean {
  const b = state.bloc2;

  // Perspectives groupé / moments : données dans bloc4.perspectives / bloc4.moments,
  // pas d'upload iconographique séparé → publishable === complete.
  const blocConfig = getWizardBlocConfig(b.comportementId);
  if (blocConfig?.bloc4.type === "perspectives" && state.bloc3.perspectivesMode === "groupe") {
    return isPerspectivesStepComplete(
      state.bloc4.perspectives,
      blocConfig.bloc4.count,
      state.bloc4.perspectivesTitre,
    );
  }
  if (blocConfig?.bloc4.type === "moments") {
    return isMomentsStepComplete(state.bloc4.moments, 2, state.bloc4.momentsTitre);
  }

  if (isActiveOrdreChronologiqueVariant(state)) {
    return isOrdreChronologiqueDocumentsPublishable(b.documentSlots, state.bloc4.documents);
  }
  if (isActiveLigneDuTempsVariant(state)) {
    return isDocumentsStepPublishable(b.documentSlots, state.bloc4.documents);
  }
  if (isActiveAvantApresVariant(state)) {
    return isAvantApresDocumentsPublishable(b.documentSlots, state.bloc4.documents);
  }
  return isDocumentsStepPublishable(b.documentSlots, state.bloc4.documents);
}

function documentsCompleteButUrlsBlocked(state: TaeFormState): boolean {
  const b = state.bloc2;

  // Perspectives groupé / moments : pas d'upload iconographique séparé → jamais bloqué par URL.
  const blocConfig = getWizardBlocConfig(b.comportementId);
  if (blocConfig?.bloc4.type === "perspectives" && state.bloc3.perspectivesMode === "groupe") {
    return false;
  }
  if (blocConfig?.bloc4.type === "moments") {
    return false;
  }

  if (isActiveOrdreChronologiqueVariant(state)) {
    return (
      isOrdreChronologiqueDocumentsStepComplete(b.documentSlots, state.bloc4.documents) &&
      !isOrdreChronologiqueDocumentsPublishable(b.documentSlots, state.bloc4.documents)
    );
  }
  if (isActiveLigneDuTempsVariant(state)) {
    return isDocumentsCompleteButNotPublishable(b.documentSlots, state.bloc4.documents);
  }
  if (isActiveAvantApresVariant(state)) {
    return (
      isAvantApresDocumentsStepComplete(b.documentSlots, state.bloc4.documents) &&
      !isAvantApresDocumentsPublishable(b.documentSlots, state.bloc4.documents)
    );
  }
  return isDocumentsCompleteButNotPublishable(b.documentSlots, state.bloc4.documents);
}

/** Toutes les étapes requises avant `is_published = true` côté serveur. */
export function isWizardPublishReady(state: TaeFormState): boolean {
  if (!conceptionOkForPublish(state.bloc1)) return false;
  const b = state.bloc2;
  if (!b.blueprintLocked || !isBlueprintFieldsComplete(b)) return false;
  if (!redactionStepOkForPublish(state)) return false;
  if (!documentsStepOkForPublish(state)) return false;
  if (isActiveLigneDuTempsVariant(state)) {
    const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
    if (p === null || !isLigneDuTempsStep5SegmentComplete(p)) return false;
  }
  if (isActiveAvantApresVariant(state)) {
    const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
    if (p === null) return false;
    if (
      !isAvantApresPayloadConsistentWithDocuments(
        p,
        state.bloc2.documentSlots.map((s) => s.slotId),
        state.bloc4.documents,
      )
    ) {
      return false;
    }
  }
  if (!isCdStepComplete(state)) return false;
  if (!isConnaissancesStepComplete(state)) return false;
  return true;
}

/** Prêt partout sauf URL publique pour un document iconographique (infobulle Publier). */
export function isPublishBlockedOnlyByIconographicUrls(state: TaeFormState): boolean {
  if (!conceptionOkForPublish(state.bloc1)) return false;
  const b = state.bloc2;
  if (!b.blueprintLocked || !isBlueprintFieldsComplete(b)) return false;
  if (!redactionStepOkForPublish(state)) return false;
  if (!documentsCompleteButUrlsBlocked(state)) return false;
  if (isActiveLigneDuTempsVariant(state)) {
    const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
    if (p === null || !isLigneDuTempsStep5SegmentComplete(p)) return false;
  }
  if (isActiveAvantApresVariant(state)) {
    const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
    if (p === null) return false;
    if (
      !isAvantApresPayloadConsistentWithDocuments(
        p,
        state.bloc2.documentSlots.map((s) => s.slotId),
        state.bloc4.documents,
      )
    ) {
      return false;
    }
  }
  if (!isCdStepComplete(state)) return false;
  if (!isConnaissancesStepComplete(state)) return false;
  return true;
}
