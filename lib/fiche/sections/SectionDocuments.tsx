"use client";

import type { DocumentsData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { documentFicheVersRenderer } from "@/lib/documents/document-fiche-vers-renderer";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";

type Props = { data: DocumentsData; mode: FicheMode };

/** Documents historiques — rendus via le composant canonique DocumentCard. */
export function SectionDocuments({ data, mode: _mode }: Props) {
  const title = ficheDocumentsSectionTitle(data.documents.length);

  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="article">{title}</SectionLabel>

      <div className={`${FICHE_SECTION_BODY_INSET} flex flex-col gap-3`}>
        {data.documents.map((doc) => (
          <div key={doc.numero} className="rounded-lg border border-border bg-panel p-4">
            <DocumentCard document={documentFicheVersRenderer(doc)} />
          </div>
        ))}
      </div>
    </section>
  );
}
