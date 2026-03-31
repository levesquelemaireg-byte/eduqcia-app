"use client";

import { DOCUMENT_MODULE_SUBMIT } from "@/lib/ui/ui-copy";

type Props = {
  canPrev: boolean;
  onPrev: () => void;
  /** Étape confirmation : pas de « Suivant ». */
  showNext: boolean;
  onNext: () => void;
  nextDisabled: boolean;
  onSaveDraft: () => void;
  draftSaving: boolean;
  /** Étape confirmation — soumission finale. */
  showSubmit: boolean;
  onSubmit: () => void;
  submitDisabled: boolean;
  isSubmitting: boolean;
};

/**
 * Pied de wizard — mêmes classes que `StepperNavFooter` (wizard TAÉ).
 */
export function DocumentWizardNavFooter({
  canPrev,
  onPrev,
  showNext,
  onNext,
  nextDisabled,
  onSaveDraft,
  draftSaving,
  showSubmit,
  onSubmit,
  submitDisabled,
  isSubmitting,
}: Props) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            arrow_back
          </span>
          Précédent
        </button>
        {showNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Suivant
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        ) : null}
        {showSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled || isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex min-h-11 min-w-[7.5rem] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Enregistrement…" : DOCUMENT_MODULE_SUBMIT}
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
        <button
          type="button"
          disabled={draftSaving}
          onClick={onSaveDraft}
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
      </div>
    </div>
  );
}
