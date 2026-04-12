"use client";

import type { DocumentsSectionData } from "@/lib/fiche/selectors/tache/documents";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { DocCard } from "@/lib/fiche/primitives/DocCard";

type Props = {
  data: DocumentsSectionData;
  /** Handler de clic sur une DocCard — ouvre la modale fiche document. */
  surClicDocument?: (docId: string) => void;
};

/**
 * Section Documents de la vue détaillée tâche.
 * Liste verticale de DocCards numérotées avec icône catégorie.
 */
export function SectionDocuments({ data, surClicDocument }: Props) {
  return (
    <section>
      <SectionLabel icon="article">{data.sectionLabel}</SectionLabel>

      <div className="flex flex-col gap-3">
        {data.cards.map((card) => (
          <DocCard
            key={card.docId}
            doc={card.doc}
            mode="lecture"
            numero={card.numero}
            categorieGlyph={card.categorieGlyph}
            onClick={surClicDocument ? () => surClicDocument(card.docId) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
