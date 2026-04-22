"use client";

import type { ReactNode } from "react";
import { useEffect, useId } from "react";
import { WIZARD_PRINT_PREVIEW_COPY } from "@/components/tache/wizard/preview/wizard-print-preview-copy";
import { Button } from "@/components/ui/Button";
import { TAE_PRINT_PAGE_CSS, TAE_PRINT_PAGE_STYLE_ATTR } from "@/lib/tache/print-page-css";
import { useClearDocumentTitleForPrint } from "@/lib/tache/use-clear-document-title-for-print";

const PRINT_PREVIEW_MODAL_HTML_CLASS = "tae-print-preview-modal-open";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Modale aperçu impression — même chrome que le wizard TAÉ, contenu libre (document autonome).
 */
export function DocumentWizardPrintModal({ open, onClose, children }: Props) {
  const titleId = useId();

  useClearDocumentTitleForPrint(open);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add(PRINT_PREVIEW_MODAL_HTML_CLASS);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove(PRINT_PREVIEW_MODAL_HTML_CLASS);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const style = document.createElement("style");
    style.setAttribute(TAE_PRINT_PAGE_STYLE_ATTR, "");
    style.textContent = TAE_PRINT_PAGE_CSS;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="tae-print-preview-root fixed inset-0 z-50 flex flex-col" role="presentation">
      <button
        type="button"
        className="tae-print-preview-chrome absolute inset-0 bg-black/50 print:hidden"
        aria-label={WIZARD_PRINT_PREVIEW_COPY.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex min-h-0 flex-1 flex-col bg-deep/25"
      >
        <header className="tae-print-preview-chrome flex shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-4 py-3 shadow-sm print:hidden sm:px-5">
          <h2 id={titleId} className="text-lg font-semibold text-deep">
            {WIZARD_PRINT_PREVIEW_COPY.modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep"
            aria-label={WIZARD_PRINT_PREVIEW_COPY.close}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              close
            </span>
          </button>
        </header>

        <div className="tae-print-preview-scroll flex min-h-0 flex-1 justify-center overflow-x-hidden overflow-y-auto overscroll-none bg-steel/25 px-4 py-8 sm:px-8">
          {children}
        </div>

        <footer className="tae-print-preview-chrome flex shrink-0 flex-col gap-3 border-t border-border bg-panel px-4 py-3 print:hidden sm:px-5">
          <p className="text-xs leading-snug text-muted">
            {WIZARD_PRINT_PREVIEW_COPY.printHeadersFootersHint}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {WIZARD_PRINT_PREVIEW_COPY.close}
            </Button>
            <Button type="button" variant="primary" onClick={() => window.print()}>
              {WIZARD_PRINT_PREVIEW_COPY.print}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
