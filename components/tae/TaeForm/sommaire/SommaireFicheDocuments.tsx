import { SommaireDocuments } from "@/components/tae/TaeForm/SommaireDocuments";
import { SkeletonDocumentsBlock } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";

type Props = {
  documentSlotCount: number;
  debouncedDocuments: Partial<Record<DocumentSlotId, DocumentSlotData>>;
};

export function SommaireFicheDocuments({ documentSlotCount, debouncedDocuments }: Props) {
  if (documentSlotCount === 0) {
    return (
      <section aria-labelledby="sommaire-documents-empty">
        <h4
          id="sommaire-documents-empty"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
        >
          <span
            className="material-symbols-outlined text-[1em]"
            aria-hidden="true"
            title={materialIconTooltip("docs")}
          >
            docs
          </span>
          {ficheDocumentsSectionTitle(0)}
        </h4>
        <div className="mt-3">
          <SkeletonDocumentsBlock />
        </div>
      </section>
    );
  }

  return <SommaireDocuments debouncedDocuments={debouncedDocuments} />;
}
