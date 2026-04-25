import { DocumentRenderer } from "@/components/document/renderer";
import { MetaPill } from "@/components/partagees/ui/meta-pill";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import type { RendererDocument } from "@/lib/types/document-renderer";
import { iconForDocumentStructure } from "@/lib/ui/icons/document-structure-icon";
import {
  FICHE_BODY_SECTION_PB,
  FICHE_BODY_SECTION_PT,
  FICHE_BODY_SECTION_PX,
  FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET,
  FICHE_HAIRLINE_RULE,
  FICHE_SECTION_TITLE_CLASS,
} from "@/lib/ui/fiche-layout";
import {
  DOCUMENT_FICHE_ASPECTS,
  DOCUMENT_FICHE_AUTEUR,
  DOCUMENT_FICHE_CONNAISSANCES,
  DOCUMENT_FICHE_DATE,
  DOCUMENT_FICHE_DISCIPLINE,
  DOCUMENT_FICHE_EYEBROW,
  DOCUMENT_FICHE_NIVEAU,
  DOCUMENT_FICHE_SECTION_INDEXATION,
  DOCUMENT_FICHE_SOURCE,
  DOCUMENT_FICHE_SOURCE_TYPE,
  DOCUMENT_FICHE_TYPE_DOCUMENT,
  DOCUMENT_MODULE_SOURCE_PRIMAIRE,
  DOCUMENT_MODULE_SOURCE_SECONDAIRE,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  documentStructureBadgeLabel,
  FICHE_SECTION_TITLE_DOCUMENT,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

const SECTION_SHELL = `${FICHE_BODY_SECTION_PX} ${FICHE_BODY_SECTION_PT} ${FICHE_BODY_SECTION_PB}`;

export type DocumentCardReaderProps = {
  document: RendererDocument;
  /** Métadonnées de classification (indexation). */
  meta: {
    /** Type de source du premier élément. */
    sourceType: "primaire" | "secondaire";
    /** Source du premier élément (HTML). */
    sourceCitation: string;
    niveauLabels: string;
    disciplineLabels: string;
    aspectsStr: string;
    connLabels: string;
    authorName: string;
    created: string;
    usageCaption: string;
  };
};

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
 * Fiche lecture d'un document — wrapper autour de `DocumentCard`.
 *
 * Affiche le document avec toutes ses structures (simple, perspectives, deux_temps)
 * via `DocumentCard`, entouré de métadonnées d'indexation.
 *
 * Spec : `docs/specs/document-renderer.md` §4.3, §5.3.
 */
export function DocumentCardReader({ document: doc, meta }: DocumentCardReaderProps) {
  const firstElement = doc.elements[0];
  const docType = firstElement?.type === "iconographique" ? "iconographique" : "textuel";
  const typeLabel = docType === "textuel" ? DOCUMENT_MODULE_TYPE_TEXT : DOCUMENT_MODULE_TYPE_IMAGE;
  const sourceTypeLabel =
    meta.sourceType === "primaire"
      ? DOCUMENT_MODULE_SOURCE_PRIMAIRE
      : DOCUMENT_MODULE_SOURCE_SECONDAIRE;
  const structureLabel = documentStructureBadgeLabel(doc.structure, doc.elements.length);
  const structureIcon = iconForDocumentStructure(doc.structure, doc.elements.length);

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-br-[18px] rounded-tr-[18px] border border-border border-l-2 border-l-accent bg-panel shadow-sm",
      )}
    >
      {/* Header */}
      <header className="relative grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-stretch">
        <div className="relative flex items-center justify-center px-1 py-0">
          <span
            className="material-symbols-outlined leading-none text-accent opacity-[0.88]"
            style={{
              fontSize: "clamp(2.5rem, 4.25vmin, 3.35rem)",
              fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 200, "opsz" 48',
            }}
            aria-hidden="true"
          >
            article
          </span>
          <span
            className={cn("absolute right-0 w-px bg-border", FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET)}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 px-4 py-[1.35rem] sm:px-5 sm:pr-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-accent">
            {DOCUMENT_FICHE_EYEBROW}
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-deep sm:text-2xl">
            {doc.titre}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <MetaPill icon="category" label={`${DOCUMENT_FICHE_TYPE_DOCUMENT} — ${typeLabel}`} />
            <MetaPill icon={structureIcon} label={structureLabel} />
            <MetaPill
              icon="bookmark"
              label={`${DOCUMENT_FICHE_SOURCE_TYPE} — ${sourceTypeLabel}`}
            />
          </div>
        </div>
      </header>

      <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />

      {/* Body : document + metadata */}
      <div className="relative grid min-w-0 grid-cols-1 min-[800px]:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
        {/* Left column — document rendering */}
        <div className="min-w-0">
          <div className={SECTION_SHELL}>
            <h2 className={FICHE_SECTION_TITLE_CLASS}>
              <span className="material-symbols-outlined text-[1em] text-accent" aria-hidden="true">
                description
              </span>
              {FICHE_SECTION_TITLE_DOCUMENT}
            </h2>
            <div className="pl-[calc(1em+0.5rem)]">
              <div className="rounded-xl border border-border bg-panel-alt p-4 sm:p-5">
                <DocumentRenderer document={doc} />
              </div>
            </div>
          </div>
        </div>

        {/* Right column — metadata */}
        <div className="relative min-w-0 max-[799px]:border-t max-[799px]:border-border min-[800px]:border-t-0">
          <span
            className={cn(
              "pointer-events-none absolute left-0 z-0 hidden min-[800px]:block w-px bg-border",
              FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET,
            )}
            aria-hidden="true"
          />
          <div className={SECTION_SHELL}>
            <h2 className={FICHE_SECTION_TITLE_CLASS}>
              <span className="material-symbols-outlined text-[1em] text-accent" aria-hidden="true">
                label
              </span>
              {DOCUMENT_FICHE_SECTION_INDEXATION}
            </h2>
            <dl className="space-y-4 pl-[calc(1em+0.5rem)]">
              <MetaRow label={DOCUMENT_FICHE_TYPE_DOCUMENT} value={typeLabel} />
              <MetaRow label={DOCUMENT_FICHE_SOURCE_TYPE} value={sourceTypeLabel} />
              {htmlHasMeaningfulText(meta.sourceCitation) ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {DOCUMENT_FICHE_SOURCE}
                  </dt>
                  <dd
                    className="mt-1 text-sm leading-relaxed text-deep wrap-break-word [&_em]:italic [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{
                      __html: sourceCitationDisplayHtml(meta.sourceCitation),
                    }}
                  />
                </div>
              ) : null}
              <MetaRow label={DOCUMENT_FICHE_NIVEAU} value={meta.niveauLabels} />
              <MetaRow label={DOCUMENT_FICHE_DISCIPLINE} value={meta.disciplineLabels} />
              <MetaRow label={DOCUMENT_FICHE_ASPECTS} value={meta.aspectsStr} />
              <MetaRow label={DOCUMENT_FICHE_CONNAISSANCES} value={meta.connLabels} />
              <MetaRow label={DOCUMENT_FICHE_AUTEUR} value={meta.authorName} />
              <MetaRow label={DOCUMENT_FICHE_DATE} value={meta.created} />
              <div>
                <dt className="sr-only">Usages</dt>
                <dd className="text-sm text-muted">{meta.usageCaption}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}
