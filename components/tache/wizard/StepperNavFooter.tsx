"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { publishTacheAction } from "@/lib/actions/tache-publish";
import { saveWizardDraftAction } from "@/lib/actions/tache-draft";
import { useWizardSession } from "@/components/tache/wizard/WizardSessionContext";
import {
  TACHE_BLUEPRINT_STEP_INDEX,
  TACHE_FORM_STEP_COUNT,
  useTacheForm,
} from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  isPublishBlockedOnlyByIconographicUrls,
  isWizardPublishReady,
} from "@/lib/tache/wizard-publish-guards";
import { isStepReadyForNext, TOAST_NEXT_COMPLETER } from "@/lib/tache/wizard-step-next-gate";
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

const PUBLISH_FAILURE_TOAST: Record<PublishTacheFailureCode, string> = {
  validation: TOAST_PUBLICATION_VALIDATION,
  lookup_niveau: TOAST_PUBLICATION_LOOKUP_NIVEAU,
  lookup_discipline: TOAST_PUBLICATION_LOOKUP_DISCIPLINE,
  lookup_cd: TOAST_PUBLICATION_LOOKUP_CD,
  lookup_connaissance: TOAST_PUBLICATION_LOOKUP_CONNAISSANCE,
  document_image: TOAST_PUBLICATION_DOCUMENT_IMAGE,
  document_insert: TOAST_PUBLICATION_FAILED,
  tache_insert: TOAST_PUBLICATION_FAILED,
  tache_documents_insert: TOAST_PUBLICATION_FAILED,
  rpc_foreign_key: TOAST_PUBLICATION_RPC_FOREIGN_KEY,
  rpc_invalid_enum: TOAST_PUBLICATION_RPC_ENUM,
  rpc_function_missing: TOAST_PUBLICATION_RPC_FUNCTION_MISSING,
  tache_locked_evaluation: TOAST_PUBLICATION_TACHE_LOCKED_EVALUATION,
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

  const stepReady = isStepReadyForNext(state, state.currentStep);
  const nextDisabled = !canNext || !stepReady;
  const nextTitle = stepReady ? undefined : TOAST_NEXT_COMPLETER;

  const handleNext = () => {
    if (!canNext) return;
    if (!stepReady) {
      toast.error(TOAST_NEXT_COMPLETER);
      return;
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
              title={nextTitle}
              aria-disabled={nextDisabled || undefined}
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
