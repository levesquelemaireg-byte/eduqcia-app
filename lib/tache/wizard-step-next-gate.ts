/**
 * Gate « Suivant » du wizard TAÉ — source de vérité unique pour le bouton Suivant.
 *
 * Renvoie, pour l'étape courante, si l'enseignant peut avancer. Utilisé à la fois
 * pour :
 *   - calculer l'état `disabled` du bouton (feedback visuel + curseur bloquant +
 *     tooltip « Veuillez compléter tous les champs obligatoires avant de continuer »);
 *   - bloquer le clic effectif dans `handleNext` et déclencher le même toast.
 *
 * La logique dépend du parcours (section_a / section_b / section_c) et, pour
 * Section A, du comportement OI. Toutes les vérifications sont pures.
 */

import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { isCdStepComplete } from "@/lib/tache/cd-step-guards";
import { isDocumentsStepComplete } from "@/lib/tache/document-helpers";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import { isConnaissancesStepComplete } from "@/lib/tache/connaissances-step-guards";
import { isProfileCollaborateurId } from "@/lib/tache/collaborateur-user-ids";
import {
  isAvantApresBloc5CompleteForNext,
  isAvantApresDocumentsStepComplete,
  isAvantApresRedactionStepCompleteForNext,
  normalizeAvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  isLigneDuTempsStep3Complete,
  isLigneDuTempsStep5SegmentComplete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  isOrdreChronologiqueDocumentsStepComplete,
  isOrdreChronologiqueStep3ConsigneComplete,
  isOrdreChronologiqueStep5OptionsComplete,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  isActiveAvantApresVariant,
  isActiveLigneDuTempsVariant,
  isActiveNonRedactionVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tache/non-redaction/wizard-variant";
import {
  isMomentsStepComplete,
  isPerspectivesStepComplete,
} from "@/lib/tache/oi-perspectives/perspectives-helpers";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import {
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tache/wizard-state-nr";
import {
  isSchemaCd1ChapeauReady,
  compterCasesCompletes,
  caseEstComplete,
  obtenirCase,
  TOUTES_LES_CASES,
} from "@/lib/tache/schema-cd1/types";
import {
  TACHE_BLOC5_STEP_INDEX,
  TACHE_BLUEPRINT_STEP_INDEX,
  TACHE_CD_STEP_INDEX,
  TACHE_CONCEPTION_STEP_INDEX,
  TACHE_CONNAISSANCES_STEP_INDEX,
  TACHE_DOCUMENTS_STEP_INDEX,
  TACHE_REDACTION_STEP_INDEX,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";

/** Même règle que `FormState.isConceptionStepComplete`. */
function conceptionOk(c: TacheFormState["bloc1"]): boolean {
  if (c.modeConception === "seul") return true;
  if (c.modeConception === "equipe") {
    if (c.collaborateurs.length < 1) return false;
    return c.collaborateurs.every((x) => isProfileCollaborateurId(x.id));
  }
  return false;
}

function isBloc3PerspectivesReadyForNext(state: TacheFormState): boolean {
  const config = getWizardBlocConfig(state.bloc2.comportementId);
  if (!config) return true;
  if (config.bloc3.type === "structure") {
    if (state.bloc3.perspectivesMode === null) return false;
    if (state.bloc3.perspectivesContexte.trim().length === 0) return false;
    return true;
  }
  if (config.bloc3.type === "pur") {
    if (config.bloc3.variante === "oi6") {
      if (state.bloc3.perspectivesMode === null) return false;
      if (state.bloc3.oi6Enjeu.trim().length === 0) return false;
      return true;
    }
    if (config.bloc3.variante === "oi7") {
      if (state.bloc3.consigneMode === "personnalisee") {
        return htmlHasMeaningfulText(state.bloc3.consigne);
      }
      if (state.bloc3.oi7EnjeuGlobal.trim().length === 0) return false;
      if (state.bloc3.oi7Element1.trim().length === 0) return false;
      if (state.bloc3.oi7Element2.trim().length === 0) return false;
      if (state.bloc3.oi7Element3.trim().length === 0) return false;
      return true;
    }
    if (state.bloc3.perspectivesMode === null) return false;
    if (state.bloc3.perspectivesContexte.trim().length === 0) return false;
    return true;
  }
  return true;
}

function isBloc5IntrusActive(state: TacheFormState): boolean {
  const config = getWizardBlocConfig(state.bloc2.comportementId);
  return config?.bloc5?.type === "intrus";
}

function isBloc5IntrusCompleteForNext(state: TacheFormState): boolean {
  const intrus = state.bloc5.intrus;
  if (!intrus) return false;
  if (intrus.intrusLetter === "") return false;
  if (!htmlHasMeaningfulText(intrus.explicationDifference)) return false;
  if (!htmlHasMeaningfulText(intrus.pointCommun)) return false;
  return true;
}

function isSchemaCd1SeptCasesCompletes(state: TacheFormState): boolean {
  const schema = state.bloc3.schemaCd1;
  if (!schema) return false;
  return compterCasesCompletes(schema) === TOUTES_LES_CASES.length;
}

function isSchemaCd1AuMoinsUneCase(state: TacheFormState): boolean {
  const schema = state.bloc3.schemaCd1;
  if (!schema) return false;
  for (const cle of TOUTES_LES_CASES) {
    if (caseEstComplete(obtenirCase(schema, cle))) return true;
  }
  return false;
}

/**
 * Retourne `true` si l'étape courante est suffisamment remplie pour avancer.
 * Fonction pure — appelée à chaque render pour dériver `disabled`.
 */
export function isStepReadyForNext(state: TacheFormState, stepIndex: number): boolean {
  if (stepIndex === TACHE_CONCEPTION_STEP_INDEX) {
    return conceptionOk(state.bloc1);
  }
  if (stepIndex === TACHE_BLUEPRINT_STEP_INDEX) {
    return isBlueprintFieldsComplete(state.bloc2);
  }
  const parcours = resoudreParcours(state.bloc2.typeTache);

  if (stepIndex === TACHE_REDACTION_STEP_INDEX) {
    if (parcours.bloc3Type === "schema_cd1") {
      // Section B : chapeau (objet + période) requis pour avancer au bloc 4.
      // Le schéma complet n'est vérifié qu'à la publication.
      return isSchemaCd1ChapeauReady(state.bloc3.schemaCd1);
    }
    if (isActiveOrdreChronologiqueVariant(state)) {
      const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
      return p !== null && isOrdreChronologiqueStep3ConsigneComplete(p);
    }
    if (isActiveLigneDuTempsVariant(state)) {
      const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
      return p !== null && isLigneDuTempsStep3Complete(p);
    }
    if (isActiveAvantApresVariant(state)) {
      const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
      return p !== null && isAvantApresRedactionStepCompleteForNext(p);
    }
    if (!isBloc3PerspectivesReadyForNext(state)) return false;
    return htmlHasMeaningfulText(state.bloc3.consigne);
  }

  if (stepIndex === TACHE_DOCUMENTS_STEP_INDEX) {
    const blocConfig = getWizardBlocConfig(state.bloc2.comportementId);
    const isPerspectivesGroupe =
      blocConfig?.bloc4.type === "perspectives" && state.bloc3.perspectivesMode === "groupe";
    const isMomentsGroupe =
      blocConfig?.bloc4.type === "moments" && state.bloc3.perspectivesMode === "groupe";

    if (isPerspectivesGroupe) {
      const count = blocConfig.bloc4.type === "perspectives" ? blocConfig.bloc4.count : 2;
      return isPerspectivesStepComplete(
        state.bloc4.perspectives,
        count,
        state.bloc4.perspectivesTitre,
      );
    }
    if (isMomentsGroupe) {
      return isMomentsStepComplete(state.bloc4.moments, 2, state.bloc4.momentsTitre);
    }
    if (isActiveOrdreChronologiqueVariant(state)) {
      return isOrdreChronologiqueDocumentsStepComplete(
        state.bloc2.documentSlots,
        state.bloc4.documents,
      );
    }
    if (isActiveAvantApresVariant(state)) {
      return isAvantApresDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents);
    }
    return isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents);
  }

  if (stepIndex === TACHE_BLOC5_STEP_INDEX) {
    if (parcours.bloc5Type === "corrige_cd1") {
      // Section B : au moins une case complète pour avancer au bloc 6 (CD auto).
      // La checklist finale est validée à la publication.
      return isSchemaCd1SeptCasesCompletes(state) || isSchemaCd1AuMoinsUneCase(state);
    }
    if (isActiveOrdreChronologiqueVariant(state)) {
      const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
      return p !== null && isOrdreChronologiqueStep5OptionsComplete(p);
    }
    if (isActiveLigneDuTempsVariant(state)) {
      const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
      return p !== null && isLigneDuTempsStep5SegmentComplete(p);
    }
    if (isActiveAvantApresVariant(state)) {
      const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
      return p !== null && isAvantApresBloc5CompleteForNext(p);
    }
    if (isBloc5IntrusActive(state)) {
      return isBloc5IntrusCompleteForNext(state);
    }
    if (!isActiveNonRedactionVariant(state)) {
      return htmlHasMeaningfulText(state.bloc5.corrige);
    }
    return true;
  }

  if (stepIndex === TACHE_CD_STEP_INDEX) {
    return isCdStepComplete(state);
  }

  if (stepIndex === TACHE_CONNAISSANCES_STEP_INDEX) {
    // Dernière étape — pas de bouton Suivant, mais on renvoie la complétude pour cohérence.
    return isConnaissancesStepComplete(state);
  }

  return true;
}

export const TOAST_NEXT_COMPLETER =
  "Veuillez compléter tous les champs obligatoires avant de continuer.";
