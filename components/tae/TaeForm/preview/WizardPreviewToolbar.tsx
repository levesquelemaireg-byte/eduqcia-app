"use client";

import { WIZARD_PRINT_PREVIEW_COPY } from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  onOpenPrintPreview: () => void;
  className?: string;
};

/**
 * Bouton flottant — aperçu avant impression (icône seule, `aria-label` = DECISIONS).
 */
export function WizardPreviewToolbar({ onOpenPrintPreview, className }: Props) {
  return (
    <div className={cn("pointer-events-none absolute right-8 top-8 z-20", className)}>
      <button
        type="button"
        onClick={onOpenPrintPreview}
        className={cn(
          "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_4px_24px_rgb(0_0_0/0.18)] backdrop-blur-md transition-[color,background-color,box-shadow] duration-200",
          "border border-white/[0.14] bg-[color-mix(in_oklab,var(--wizard-preview-canvas)_78%,white_22%)]",
          "text-white/95 hover:bg-[color-mix(in_oklab,var(--wizard-preview-canvas)_65%,white_35%)] hover:text-white active:opacity-95",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        )}
        aria-label={WIZARD_PRINT_PREVIEW_COPY.toolbarPrint}
      >
        <span className="material-symbols-outlined text-[1.375rem]" aria-hidden="true">
          print
        </span>
      </button>
    </div>
  );
}
