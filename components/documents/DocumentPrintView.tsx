"use client";

import Link from "next/link";
import { toast } from "sonner";
import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
import { Button } from "@/components/ui/Button";
import { WIZARD_PRINT_PREVIEW_COPY } from "@/components/tache/wizard/preview/wizard-print-preview-copy";
import type { RendererDocument } from "@/lib/types/document-renderer";

type Props = {
  documentId: string;
  document: RendererDocument;
  numero?: number;
};

const TOAST_PDF_NOT_AVAILABLE =
  "Le téléchargement PDF n'est pas encore disponible. Utilisez Imprimer puis « Enregistrer au format PDF » du navigateur.";

/**
 * Page impression document : barre d'actions (masquée en print) + rendu pixel-perfect.
 */
export function DocumentPrintView({ documentId, document: doc, numero }: Props) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.info(TOAST_PDF_NOT_AVAILABLE);
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
              href={`/documents/${documentId}`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {WIZARD_PRINT_PREVIEW_COPY.backToFiche}
            </Link>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={handleDownloadPdf}>
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  picture_as_pdf
                </span>
                {WIZARD_PRINT_PREVIEW_COPY.downloadPdf}
              </Button>
              <Button type="button" variant="primary" onClick={handlePrint}>
                {WIZARD_PRINT_PREVIEW_COPY.print}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="tache-print-page-main flex flex-1 justify-center px-4 py-8 sm:px-8">
        <DocumentCardPrint document={doc} numero={numero} />
      </div>
    </div>
  );
}
