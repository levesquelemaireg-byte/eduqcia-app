"use client";

import Link from "next/link";
import { PrintableFicheFromTacheData } from "@/components/tache/wizard/preview/PrintableFichePreview";
import { WIZARD_PRINT_PREVIEW_COPY } from "@/components/tache/wizard/preview/wizard-print-preview-copy";
import { Button } from "@/components/ui/Button";
import type { TacheFicheData } from "@/lib/types/fiche";

type Props = {
  tacheId: string;
  tache: TacheFicheData;
};

/**
 * Page impression TAÉ : contenu = feuille seule à l’impression ; barre d’actions masquée en print.
 */
export function TacheFichePrintView({ tacheId, tache }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="tache-print-screen-only border-b border-border bg-panel px-4 py-3 shadow-sm sm:px-6">
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
              href={`/questions/${tacheId}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {WIZARD_PRINT_PREVIEW_COPY.backToFiche}
            </Link>
            <Button type="button" variant="primary" onClick={handlePrint}>
              {WIZARD_PRINT_PREVIEW_COPY.print}
            </Button>
          </div>
        </div>
      </div>

      <div className="tache-print-page-main flex flex-1 justify-center px-4 py-8 sm:px-8">
        <PrintableFicheFromTacheData tache={tache} />
      </div>
    </div>
  );
}
