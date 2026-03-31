"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { publishTaeAction } from "@/lib/actions/tae-publish";
import { saveWizardDraftAction } from "@/lib/actions/tae-draft";
import { useWizardSession } from "@/components/tae/TaeForm/WizardSessionContext";
import {
  getRedactionSliceForPreview,
  TAE_BLUEPRINT_STEP_INDEX,
  TAE_CD_STEP_INDEX,
  TAE_DOCUMENTS_STEP_INDEX,
  TAE_FORM_STEP_COUNT,
  TAE_REDACTION_STEP_INDEX,
  isConceptionStepComplete,
  useTaeForm,
} from "@/components/tae/TaeForm/FormState";
import { isCdStepComplete } from "@/lib/tae/cd-step-guards";
import { isDocumentsStepComplete } from "@/lib/tae/document-helpers";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import {
  isLigneDuTempsStep3Complete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import {
  isOrdreChronologiqueDocumentsStepComplete,
  isOrdreChronologiqueStep3Complete,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import {
  isActiveLigneDuTempsVariant,
  isActiveOrdreChronologiqueVariant,
} from "@/lib/tae/non-redaction/wizard-variant";
import { nonRedactionLignePayload, nonRedactionOrdrePayload } from "@/lib/tae/wizard-state-nr";
import { isRedactionStepComplete } from "@/lib/tae/redaction-helpers";
import {
  isPublishBlockedOnlyByIconographicUrls,
  isWizardPublishReady,
} from "@/lib/tae/wizard-publish-guards";
import type { PublishTaeFailureCode } from "@/lib/tae/publish-tae";
import { TAE_DRAFT_STORAGE_KEY } from "@/lib/tae/tae-draft-storage-key";
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
  TOAST_PUBLICATION_TAE_LOCKED_EVALUATION,
  TOAST_TACHE_MAJ_SUCCES,
  TOAST_TACHE_PUBLIEE_SUCCES,
  TOAST_TAE_PUBLISH_UNPUBLISHED_DOCS,
  WIZARD_EDIT_SAVE_CTA,
  WIZARD_PUBLISH_CTA,
} from "@/lib/ui/ui-copy";

const PUBLISH_FAILURE_TOAST: Record<PublishTaeFailureCode, string> = {
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
  tae_locked_evaluation: TOAST_PUBLICATION_TAE_LOCKED_EVALUATION,
};

export function StepperNavFooter() {
  const router = useRouter();
  const { state, dispatch } = useTaeForm();
  const { editingTaeId, persistSessionDraft } = useWizardSession();
  const [draftSaving, setDraftSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const canPrev = state.currentStep > 0;
  const canNext = state.currentStep < TAE_FORM_STEP_COUNT - 1;

  const conceptionIncomplete = state.currentStep === 0 && !isConceptionStepComplete(state.bloc1);

  const blueprintIncomplete =
    state.currentStep === TAE_BLUEPRINT_STEP_INDEX &&
    !state.bloc2.blueprintLocked &&
    !isBlueprintFieldsComplete(state.bloc2);

  const blueprintGate = isBlueprintFieldsComplete(state.bloc2) && state.bloc2.blueprintLocked;

  const nextDisabled = !canNext || conceptionIncomplete || blueprintIncomplete;

  const handleNext = () => {
    if (nextDisabled) return;
    if (state.currentStep === TAE_REDACTION_STEP_INDEX) {
      if (!blueprintGate) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      }
      if (isActiveOrdreChronologiqueVariant(state)) {
        const p = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
        if (!p || !isOrdreChronologiqueStep3Complete(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (isActiveLigneDuTempsVariant(state)) {
        const p = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
        if (!p || !isLigneDuTempsStep3Complete(p)) {
          toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
          return;
        }
      } else if (!isRedactionStepComplete(getRedactionSliceForPreview(state))) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      }
    }
    if (state.currentStep === TAE_DOCUMENTS_STEP_INDEX) {
      if (isActiveOrdreChronologiqueVariant(state)) {
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
      } else if (!isDocumentsStepComplete(state.bloc2.documentSlots, state.bloc4.documents)) {
        toast.error("Tous les documents doivent être complétés avant de continuer.");
        return;
      }
    }
    if (state.currentStep === TAE_CD_STEP_INDEX) {
      if (!isCdStepComplete(state)) {
        toast.error("Veuillez compléter tous les champs obligatoires avant de continuer.");
        return;
      }
    }
    if (state.currentStep === TAE_BLUEPRINT_STEP_INDEX) {
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

  const handlePublish = async () => {
    if (!canPublish || publishing) return;
    setPublishing(true);
    try {
      const result = await publishTaeAction(state, editingTaeId ?? null);
      if (result.ok) {
        if (persistSessionDraft) {
          try {
            sessionStorage.removeItem(TAE_DRAFT_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
        toast.success(editingTaeId ? TOAST_TACHE_MAJ_SUCCES : TOAST_TACHE_PUBLIEE_SUCCES);
        if (result.unpublishedDocumentsCreated) {
          toast.message(TOAST_TAE_PUBLISH_UNPUBLISHED_DOCS);
        }
        router.push(`/questions/${result.taeId}`);
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

  return (
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
            Sauvegarder le brouillon
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
          {editingTaeId ? WIZARD_EDIT_SAVE_CTA : WIZARD_PUBLISH_CTA}
        </button>
      </div>
    </div>
  );
}
