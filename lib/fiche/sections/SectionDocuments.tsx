"use client";

import type { DocumentsData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { DocCard } from "@/lib/fiche/primitives/DocCard";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";

type Props = { data: DocumentsData; mode: FicheMode };

/** Documents historiques — cards compactes par mode. */
export function SectionDocuments({ data, mode }: Props) {
  const title = ficheDocumentsSectionTitle(data.documents.length);

  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="docs">{title}</SectionLabel>

      <div className={`${FICHE_SECTION_BODY_INSET} flex flex-col gap-3`}>
        {data.documents.map((doc) => (
          <DocCard key={doc.letter} doc={doc} mode={mode} />
        ))}
      </div>
    </section>
  );
}
