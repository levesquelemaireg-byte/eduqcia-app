"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EvaluationPrintableBody } from "@/components/evaluations/EvaluationPrintableBody";
import { WIZARD_PRINT_PREVIEW_COPY } from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";
import type { TaeFicheData } from "@/lib/types/fiche";
import { EVAL_PRINT_BACK_TO_EDIT } from "@/lib/ui/ui-copy";

type Props = {
  evaluationId: string;
  titre: string;
  fiches: TaeFicheData[];
};

/**
 * Route `/evaluations/[id]/print` — même principe que `TaeFichePrintView` (barre écran + feuille épreuve).
 */
export function EvaluationFichePrintView({ evaluationId, titre, fiches }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="tae-print-screen-only print-controls border-b border-border bg-panel px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <div
            className="rounded-md border border-border border-l-4 border-l-accent bg-panel-alt/40 px-3 py-2.5"
            role="note"
          >
            <p className="text-xs font-medium leading-snug text-deep">
              {WIZARD_PRINT_PREVIEW_COPY.printHeadersFootersHint}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/evaluations/${evaluationId}/edit`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {EVAL_PRINT_BACK_TO_EDIT}
            </Link>
            <Button type="button" variant="primary" onClick={handlePrint}>
              {WIZARD_PRINT_PREVIEW_COPY.print}
            </Button>
          </div>
        </div>
      </div>

      <div className="tae-print-page-main flex flex-1 justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-4xl">
          <EvaluationPrintableBody titre={titre} fiches={fiches} />
        </div>
      </div>
    </div>
  );
}
