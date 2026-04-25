"use client";

import type { DocumentsSectionData } from "@/lib/fiche/selectors/tache/documents";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { DocumentRenderer } from "@/components/document/renderer";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = {
  data: DocumentsSectionData;
  /** Handler de clic sur un document — ouvre la modale fiche document. */
  surClicDocument?: (docId: string) => void;
};

/**
 * Section Documents de la vue détaillée tâche.
 * Liste verticale de DocumentCards numérotées via le renderer canonique.
 */
export function SectionDocuments({ data, surClicDocument }: Props) {
  return (
    <section>
      <SectionLabel icon={ICONES_METIER.documents}>{data.sectionLabel}</SectionLabel>

      <div className="flex flex-col gap-3">
        {data.cards.map((card) => {
          const content = (
            <DocumentRenderer key={card.docId} document={card.document} numero={card.numero} />
          );

          if (surClicDocument) {
            return (
              <button
                key={card.docId}
                type="button"
                className="w-full cursor-pointer rounded-lg border-[0.5px] border-border bg-panel p-4 text-left transition-colors duration-150 hover:border-border-secondary"
                onClick={() => surClicDocument(card.docId)}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={card.docId} className="rounded-lg border-[0.5px] border-border bg-panel p-4">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
