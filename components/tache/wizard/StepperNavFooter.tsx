"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { publishTacheAction } from "@/lib/actions/tache-publish";
import { saveWizardDraftAction } from "@/lib/actions/tache-draft";
import { useWizardSession } from "@/components/tache/wizard/WizardSessionContext";
import {
  TACHE_BLUEPRINT_STEP_INDEX,
  TACHE_BLOC5_STEP_INDEX,
  TACHE_CD_STEP_INDEX,
  TACHE_DOCUMENTS_STEP_INDEX,
  TACHE_FORM_STEP_COUNT,
  TACHE_REDACTION_STEP_INDEX,
  isConceptionStepComplete,
  useTacheForm,
} from "@/components/tache/wizard/FormState";
import { isCdStepComplete } from "@/lib/tache/cd-step-guards";
import { isDocumentsStepComplete } from "@/lib/tache/document-helpers";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
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
  nonRedactionAvantApresPayload,
  nonRedactionLignePayload,
  nonRedactionOrdrePayload,
} from "@/lib/tache/wizard-state-nr";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import {
  isPublishBlockedOnlyByIconographicUrls,
  isWizardPublishReady,
} from "@/lib/tache/wizard-publish-guards";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import {
  isMomentsStepComplete,
  isPerspectivesStepComplete,
} from "@/lib/tache/oi-perspectives/perspectives-helpers";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import type { PublishTacheFailureCode } from "@/lib/tache/publish-tache";
import { detectMajorChangeFromFormState } from "@/lib/tache/publish-tache-version";
import { TACHE_DRAFT_STORAGE_KEY } from "@/lib/tache/tache-draft-storage-key";
import { WarningModal } from "@/components/ui/WarningModal";
import {
  PUBLISH_BUTTON_TITLE_DOCUMENT_IMAGE,
  TOAST_DRAFT_SAVE_FAILED,
  TOAST_PUBLICATION_DOCUMENT_IMAGE,
  TOAST_PUBLICATION_FAILED,
  TOAST_PUBLICATION_LOOKUP_CD,
  TOAST_PUBLICATION_LOOKUP_CONNAISSANCE,
  TOAST_PUBLICATION_LOOKUP_DISCIPLINE,
  TOAST_PUBLICATION_LOOKUP_NIVEAU,
  TOAST_PUBLICATION_RPC_ENUM,
  TOAST_PUBLICATION_RPC_FOREIGN_KEY,
  TOAST_PUBLICATION_RPC_FUNCTION_MISSING,
  TOAST_PUBLICATION_VALIDATION,
  TOAST_PUBLICATION_TACHE_LOCKED_EVALUATION,
  TOAST_TACHE_MAJ_SUCCES,
  TOAST_TACHE_PUBLIEE_SUCCES,
  TOAST_TACHE_PUBLISH_UNPUBLISHED_DOCS,
  WIZARD_EDIT_SAVE_CTA,
  WIZARD_PUBLISH_CTA,
  EDIT_MAJOR_VERSION_MODAL_TITLE,
  EDIT_MAJOR_VERSION_MODAL_BODY_P1,
  EDIT_MAJOR_VERSION_MODAL_BODY_P2,
  EDIT_MAJOR_VERSION_MODAL_CONFIRM,
  EDIT_MAJOR_VERSION_MODAL_CANCEL,
} from "@/lib/ui/ui-copy";

/** Guard Bloc 5 intrus — vérifie que l'intrus est sélectionné et les champs remplis. */
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

/** Guard Bloc 3 templates structurés et purs. */
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
      // OI6·6.3 : perspectivesMode + enjeu obligatoires
      if (state.bloc3.perspectivesMode === null) return false;
      if (state.bloc3.oi6Enjeu.trim().length === 0) return false;
      return true;
    }
    if (config.bloc3.variante === "oi7") {
      if (state.bloc3.consigneMode === "personnalisee") {
        // Mode libre : consigne non vide suffit
        return htmlHasMeaningfulText(state.bloc3.consigne);
      }
      // Mode gabarit : 4 champs obligatoires
      if (state.bloc3.oi7EnjeuGlobal.trim().length === 0) return false;
      if (state.bloc3.oi7Element1.trim().length === 0) return false;
      if (state.bloc3.oi7Element2.trim().length === 0) return false;
      if (state.bloc3.oi7Element3.trim().length === 0) return false;
      return true;
    }
    // OI3·3.5 (triple) : perspectives mode + contexte obligatoire
    if (state.bloc3.perspectivesMode === null) return false;
    if (state.bloc3.perspectivesContexte.trim().length === 0) return false;
    return true;
  }
  return true;
}

const PUBLISH_FAILURE_TOAST: Record<PublishTacheFailureCode, string> = {
  validation: TOAST_PUBLICATION_VALIDATION,
  lookup_niveau: TOAST_PUBLICATION_LOOKUP_NIVEAU,
  lookup_discipline: TOAST_PUBLICATION_LOOKUP_DISCIPLINE,
  lookup_cd: TOAST_PUBLICATION_LOOKUP_CD,
  lookup_connaissance: TOAST_PUBLICATION_LOOKUP_CONNAISSANCE,
  document_image: TOAST_PUBLICATION_DOCUMENT_IMAGE,
  document_insert: TOAST_PUBLICATION_FAILED,
  tae_insert: TOAST_PUBLICATION_FAILED,
  tae_documents_insert: TOAST_PUBLICATION_FAILED,
  rpc_foreign_key: TOAST_PUBLICATION_RPC_FOREIGN_KEY,
  rpc_invalid_enum: TOAST_PUBLICATION_RPC_ENUM,
  rpc_function_missing: TOAST_PUBLICATION_RPC_FUNCTION_MISSING,
  tae_locked_evaluation: TOAST_PUBLICATION_TACHE_LOCKED_EVALUATION,
};

export function StepperNavFooter() {
  const router = useRouter();
  const { state, dispatch } = useTacheForm();
  const { editingTacheId, persistSessionDraft, versionSnapshot } = useWizardSession();
  const [draftSaving, setDraftSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [majorConfirmOpen, setMajorConfirmOpen] = useState(false);
  const canPrev = state.currentStep > 0;
  const canNext = state.currentStep < TACHE_FORM_STEP_COUNT - 1;

  const conceptionIncomplete = state.currentStep === 0 && !isConceptionStepComplete(state.bloc1);

  const blueprintIncomplete =
    state.currentStep === TACHE_BLUEPRINT_STEP_INDEX &&
    !state.bloc2.blueprintLocked &&
    !isBlueprintFieldsComplete(state.bloc2);

  const blueprintGate = isBlueprintFieldsComplete(state.bloc2) && state.bloc2.blueprintLocked;

  const nextDisabled = !canNext || conceptionIncomplete || blueprintIncomplete;

  const handleNext = () => {
    if (nextDisabled) return;
    if (state.currentStep === TACHE_REDACTION_STEP_INDEX) {
      if (!blueprintGate) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      }
      if (isActiveOrdreChronologiqueVariant(state)) {
        const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
        if (!p || !isOrdreChronologiqueStep3ConsigneComplete(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (isActiveLigneDuTempsVariant(state)) {
        const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
        if (!p || !isLigneDuTempsStep3Complete(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (isActiveAvantApresVariant(state)) {
        const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
        if (!p || !isAvantApresRedactionStepCompleteForNext(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (!isBloc3PerspectivesReadyForNext(state)) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      } else if (!htmlHasMeaningfulText(state.bloc3.consigne)) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      }
    }
    if (state.currentStep === TACHE_BLOC5_STEP_INDEX) {
      if (isActiveOrdreChronologiqueVariant(state)) {
        const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
        if (!p || !isOrdreChronologiqueStep5OptionsComplete(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (isActiveLigneDuTempsVariant(state)) {
        const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
        if (!p || !isLigneDuTempsStep5SegmentComplete(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (isActiveAvantApresVariant(state)) {
        const p = normalizeAvantApresPayload(nonRedactionAvantApresPayload(state));
        if (!p || !isAvantApresBloc5CompleteForNext(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (isBloc5IntrusActive(state)) {
        if (!isBloc5IntrusCompleteForNext(state)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (!isActiveNonRedactionVariant(state)) {
        if (!htmlHasMeaningfulText(state.bloc5.corrige)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      }
    }
    if (state.currentStep === TACHE_DOCUMENTS_STEP_INDEX) {
      // PROVISOIRE — anti-pattern d'énumération identifié le 8 avril 2026 :
      // ce guard énumère tous les cas particuliers et finit toujours par en oublier un
      // (perspectives groupées + moments groupés étaient cassés en silence avant le hotfix
      // du 8 avril 2026). Solution durable : déclarer un validateur par comportement
      // dans wizard-bloc-config.ts. Voir BACKLOG.md "Anomalies identifiées" et
      // docs/todos/post-audit-corrections.md Phase 5.
      const blocConfig = getWizardBlocConfig(state.bloc2.comportementId);
      const isPerspectivesGroupe =
        blocConfig?.bloc4.type === "perspectives" && state.bloc3.perspectivesMode === "groupe";
      const isMomentsGroupe =
        blocConfig?.bloc4.type === "moments" && state.bloc3.perspectivesMode === "groupe";

      if (isPerspectivesGroupe) {
        const count = blocConfig.bloc4.type === "perspectives" ? blocConfig.bloc4.count : 2;
        if (
          !isPerspectivesStepComplete(
            state.bloc4.perspectives,
            count,
            state.bloc4.perspectivesTitre,
          )
        ) {
          toast.error("Toutes les perspectives doivent être complétées avant de continuer.");
          return;
        }
      } else if (isMomentsGroupe) {
        if (!isMomentsStepComplete(state.bloc4.moments, 2, state.bloc4.momentsTitre)) {
          toast.error("Tous les moments doivent être complétés avant de continuer.");
          return;
        }
      } else if (isActiveOrdreChronologiqueVariant(state)) {
        if (
          !isOrdreChronologiqueDocumentsStepComplete(
            state.bloc2.documentSlots,
            state.bloc4.documents,
          )
        ) {
          toast.error("Tous les documents doivent être complétés avant de continuer.");
          return;
        }
      } else if (isActiveLigneDuTempsVariant(state)) {
        if (!isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents)) {
          toast.error("Tous les documents doivent être complétés avant de continuer.");
          return;
        }
      } else if (isActiveAvantApresVariant(state)) {
        if (!isAvantApresDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents)) {
          toast.error("Tous les documents doivent être complétés avant de continuer.");
          return;
        }
      } else if (!isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents)) {
        toast.error("Tous les documents doivent être complétés avant de continuer.");
        return;
      }
    }
    if (state.currentStep === TACHE_CD_STEP_INDEX) {
      if (!isCdStepComplete(state)) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      }
    }
    if (state.currentStep === TACHE_BLUEPRINT_STEP_INDEX) {
      if (!state.bloc2.blueprintLocked) {
        if (!isBlueprintFieldsComplete(state.bloc2)) return;
        dispatch({ type: "LOCK_BLUEPRINT" });
      }
    }
    dispatch({ type: "STEP_NEXT" });
  };

  const handleSaveDraft = async () => {
    setDraftSaving(true);
    try {
      const result = await saveWizardDraftAction(state);
      if (result.ok) {
        toast.success("Modifications enregistrées (brouillon)");
        return;
      }
      toast.error(TOAST_DRAFT_SAVE_FAILED);
    } finally {
      setDraftSaving(false);
    }
  };

  const canPublish = isWizardPublishReady(state);
  const publishTitleImageOnly = isPublishBlockedOnlyByIconographicUrls(state);

  const doPublish = async () => {
    setPublishing(true);
    try {
      const result = await publishTacheAction(state, editingTacheId ?? null);
      if (result.ok) {
        if (persistSessionDraft) {
          try {
            sessionStorage.removeItem(TACHE_DRAFT_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
        toast.success(editingTacheId ? TOAST_TACHE_MAJ_SUCCES : TOAST_TACHE_PUBLIEE_SUCCES);
        if (result.unpublishedDocumentsCreated) {
          toast.message(TOAST_TACHE_PUBLISH_UNPUBLISHED_DOCS);
        }
        router.push(`/questions/${result.tacheId}`);
        return;
      }
      if (result.code === "validation") {
        toast.error(TOAST_PUBLICATION_VALIDATION);
        return;
      }
      if (result.code === "publish") {
        toast.error(PUBLISH_FAILURE_TOAST[result.failure] ?? TOAST_PUBLICATION_FAILED);
        return;
      }
      toast.error(TOAST_PUBLICATION_FAILED);
    } finally {
      setPublishing(false);
    }
  };

  const handlePublish = () => {
    if (!canPublish || publishing) return;
    // En mode édition, détecter une modification majeure → modale de confirmation
    if (
      editingTacheId &&
      versionSnapshot &&
      detectMajorChangeFromFormState(versionSnapshot, state)
    ) {
      setMajorConfirmOpen(true);
      return;
    }
    doPublish();
  };

  return (
    <>
      <WarningModal
        open={majorConfirmOpen}
        title={EDIT_MAJOR_VERSION_MODAL_TITLE}
        onClose={() => setMajorConfirmOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setMajorConfirmOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
            >
              {EDIT_MAJOR_VERSION_MODAL_CANCEL}
            </button>
            <button
              type="button"
              onClick={() => {
                setMajorConfirmOpen(false);
                doPublish();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            >
              {EDIT_MAJOR_VERSION_MODAL_CONFIRM}
            </button>
          </div>
        }
      >
        <p className="leading-relaxed">{EDIT_MAJOR_VERSION_MODAL_BODY_P1}</p>
        <p className="mt-3 leading-relaxed">{EDIT_MAJOR_VERSION_MODAL_BODY_P2}</p>
      </WarningModal>
      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "STEP_PREV" })}
            disabled={!canPrev}
            className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              arrow_back
            </span>
            Précédent
          </button>
          {canNext ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={nextDisabled}
              className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Suivant
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
          {persistSessionDraft ? (
            <button
              type="button"
              disabled={draftSaving}
              onClick={handleSaveDraft}
              aria-busy={draftSaving}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-lg ${draftSaving ? "animate-pulse" : ""}`}
                aria-hidden="true"
              >
                save
              </span>
              Sauvegarder
            </button>
          ) : null}
          <button
            type="button"
            disabled={!canPublish || publishing}
            onClick={handlePublish}
            aria-busy={publishing}
            title={publishTitleImageOnly ? PUBLISH_BUTTON_TITLE_DOCUMENT_IMAGE : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span
              className={`material-symbols-outlined text-lg ${publishing ? "animate-pulse" : ""}`}
              aria-hidden="true"
            >
              upload
            </span>
            {editingTacheId ? WIZARD_EDIT_SAVE_CTA : WIZARD_PUBLISH_CTA}
          </button>
        </div>
      </div>
    </>
  );
}
