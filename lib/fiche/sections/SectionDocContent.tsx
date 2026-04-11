"use client";

import type { DocContentData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";
import { FICHE_SECTION_TITLE_DOCUMENT } from "@/lib/ui/ui-copy";

type Props = { data: DocContentData; mode: FicheMode };

/**
 * Contenu du document — DocumentCard (simple/perspectives/deux_temps).
 * Le composant DocumentCard gère les 3 variantes en interne.
 */
export function SectionDocContent({ data, mode: _mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="description">{FICHE_SECTION_TITLE_DOCUMENT}</SectionLabel>
      <div className={FICHE_SECTION_BODY_INSET}>
        <div className="rounded-xl border border-border bg-panel-alt p-4 sm:p-5">
          <DocumentCard document={data.document} />
        </div>
      </div>
    </section>
  );
}
