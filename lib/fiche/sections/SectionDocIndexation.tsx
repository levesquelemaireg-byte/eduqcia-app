"use client";

import type { DocIndexationData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";
import {
  DOCUMENT_FICHE_SECTION_INDEXATION,
  DOCUMENT_FICHE_TYPE_DOCUMENT,
  DOCUMENT_FICHE_SOURCE_TYPE,
  DOCUMENT_FICHE_SOURCE,
  DOCUMENT_FICHE_NIVEAU,
  DOCUMENT_FICHE_DISCIPLINE,
  DOCUMENT_FICHE_ASPECTS,
  DOCUMENT_FICHE_CONNAISSANCES,
} from "@/lib/ui/ui-copy";

type Props = { data: DocIndexationData; mode: FicheMode };

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-deep wrap-break-word">{value}</dd>
    </div>
  );
}

/**
 * Indexation et références — métadonnées de classification du document.
 * Reproduit le panneau droit de DocumentCardReader en tant que section linéaire.
 */
export function SectionDocIndexation({ data, mode: _mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="label">{DOCUMENT_FICHE_SECTION_INDEXATION}</SectionLabel>
      <dl className={`${FICHE_SECTION_BODY_INSET} space-y-4`}>
        <MetaRow label={DOCUMENT_FICHE_TYPE_DOCUMENT} value={data.typeLabel} />
        <MetaRow label={DOCUMENT_FICHE_SOURCE_TYPE} value={data.sourceTypeLabel} />
        {data.sourceCitationHtml ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {DOCUMENT_FICHE_SOURCE}
            </dt>
            <dd
              className="mt-1 text-sm leading-relaxed text-deep wrap-break-word [&_em]:italic [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: data.sourceCitationHtml }}
            />
          </div>
        ) : null}
        <MetaRow label={DOCUMENT_FICHE_NIVEAU} value={data.niveauLabels} />
        <MetaRow label={DOCUMENT_FICHE_DISCIPLINE} value={data.disciplineLabels} />
        <MetaRow label={DOCUMENT_FICHE_ASPECTS} value={data.aspectsStr} />
        <MetaRow label={DOCUMENT_FICHE_CONNAISSANCES} value={data.connLabels} />
      </dl>
    </section>
  );
}
