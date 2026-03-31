import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";
import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { isDocumentPdfUrl } from "@/lib/documents/is-document-pdf-url";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import type { DocumentLegendPosition } from "@/lib/tae/document-helpers";
import {
  FICHE_BODY_SECTION_PB,
  FICHE_BODY_SECTION_PT,
  FICHE_BODY_SECTION_PX,
  FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET,
  FICHE_HAIRLINE_RULE,
  FICHE_SECTION_TITLE_CLASS,
} from "@/lib/ui/fiche-layout";
import {
  DOCUMENT_FICHE_EYEBROW,
  DOCUMENT_FICHE_SECTION_INDEXATION,
  DOCUMENT_MODULE_SOURCE_PRIMAIRE,
  DOCUMENT_MODULE_SOURCE_SECONDAIRE,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_FICHE_ASPECTS,
  DOCUMENT_FICHE_AUTEUR,
  DOCUMENT_FICHE_CONNAISSANCES,
  DOCUMENT_FICHE_DATE,
  DOCUMENT_FICHE_DISCIPLINE,
  DOCUMENT_FICHE_NIVEAU,
  DOCUMENT_FICHE_PDF_OPEN_NEW_TAB,
  DOCUMENT_FICHE_SOURCE,
  DOCUMENT_FICHE_SOURCE_TYPE,
  DOCUMENT_FICHE_TYPE_DOCUMENT,
  DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW,
  FICHE_SECTION_TITLE_DOCUMENT,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

const SECTION_SHELL = `${FICHE_BODY_SECTION_PX} ${FICHE_BODY_SECTION_PT} ${FICHE_BODY_SECTION_PB}`;

export type DocumentFicheReadProps = {
  titre: string;
  docType: "textuel" | "iconographique";
  sourceType: "primaire" | "secondaire";
  sourceCitation: string;
  niveauLabels: string;
  disciplineLabels: string;
  aspectsStr: string;
  connLabels: string;
  authorName: string;
  created: string;
  usageCaption: string;
  contenuHtml: string | null;
  imageUrl: string | null;
  legendText: string;
  legendPosition: DocumentLegendPosition | null;
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

export function DocumentFicheRead(props: DocumentFicheReadProps) {
  const {
    titre,
    docType,
    sourceType,
    sourceCitation,
    niveauLabels,
    disciplineLabels,
    aspectsStr,
    connLabels,
    authorName,
    created,
    usageCaption,
    contenuHtml,
    imageUrl,
    legendText,
    legendPosition,
  } = props;

  const typeLabel = docType === "textuel" ? DOCUMENT_MODULE_TYPE_TEXT : DOCUMENT_MODULE_TYPE_IMAGE;
  const sourceTypeLabel =
    sourceType === "primaire" ? DOCUMENT_MODULE_SOURCE_PRIMAIRE : DOCUMENT_MODULE_SOURCE_SECONDAIRE;
  const showLegendOnImage = legendText.length > 0 && legendPosition !== null;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-br-[18px] rounded-tr-[18px] border border-border border-l-2 border-l-accent bg-panel shadow-sm",
      )}
    >
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
          <h1 className="mt-2 text-xl font-bold tracking-tight text-deep sm:text-2xl">{titre}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <MetaPill icon="category" label={`${DOCUMENT_FICHE_TYPE_DOCUMENT} — ${typeLabel}`} />
            <MetaPill
              icon="bookmark"
              label={`${DOCUMENT_FICHE_SOURCE_TYPE} — ${sourceTypeLabel}`}
            />
          </div>
        </div>
      </header>

      <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" />

      <div className="relative grid min-w-0 grid-cols-1 min-[800px]:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
        <div className="min-w-0">
          <div className={SECTION_SHELL}>
            <h2 className={FICHE_SECTION_TITLE_CLASS}>
              <span className="material-symbols-outlined text-[1em] text-accent" aria-hidden="true">
                description
              </span>
              {FICHE_SECTION_TITLE_DOCUMENT}
            </h2>
            {docType === "textuel" && contenuHtml ? (
              <div
                className={cn(
                  "rounded-xl border border-border bg-panel-alt p-4 text-sm leading-relaxed text-deep sm:p-5",
                  "pl-[calc(1em+0.5rem)]",
                )}
                dangerouslySetInnerHTML={{ __html: contenuHtml }}
              />
            ) : null}

            {docType === "iconographique" && imageUrl ? (
              <figure className="space-y-2 pl-[calc(1em+0.5rem)]">
                <div className="relative min-h-[min(50vh,24rem)] overflow-hidden rounded-xl border border-border bg-panel-alt">
                  {isDocumentPdfUrl(imageUrl) ? (
                    <div className="flex flex-col gap-3 p-4 text-sm text-muted">
                      <p>{DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW}</p>
                      <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline hover:no-underline"
                      >
                        {DOCUMENT_FICHE_PDF_OPEN_NEW_TAB}
                      </a>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- URL Storage publique
                    <img
                      src={imageUrl}
                      alt=""
                      className="max-h-[min(70vh,32rem)] w-full object-contain"
                    />
                  )}
                  {showLegendOnImage ? (
                    <DocumentImageLegendOverlay text={legendText} position={legendPosition} />
                  ) : null}
                </div>
                {legendText && !showLegendOnImage ? (
                  <figcaption className="text-sm text-muted">{legendText}</figcaption>
                ) : null}
              </figure>
            ) : null}

            {docType === "textuel" && !contenuHtml ? (
              <p className="pl-[calc(1em+0.5rem)] text-sm text-muted">—</p>
            ) : null}
            {docType === "iconographique" && !imageUrl ? (
              <p className="pl-[calc(1em+0.5rem)] text-sm text-muted">—</p>
            ) : null}
          </div>
        </div>

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
              {htmlHasMeaningfulText(sourceCitation) ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {DOCUMENT_FICHE_SOURCE}
                  </dt>
                  <dd
                    className="mt-1 text-sm leading-relaxed text-deep wrap-break-word [&_em]:italic [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{
                      __html: sourceCitationDisplayHtml(sourceCitation),
                    }}
                  />
                </div>
              ) : null}
              <MetaRow label={DOCUMENT_FICHE_NIVEAU} value={niveauLabels} />
              <MetaRow label={DOCUMENT_FICHE_DISCIPLINE} value={disciplineLabels} />
              <MetaRow label={DOCUMENT_FICHE_ASPECTS} value={aspectsStr} />
              <MetaRow label={DOCUMENT_FICHE_CONNAISSANCES} value={connLabels} />
              <MetaRow label={DOCUMENT_FICHE_AUTEUR} value={authorName} />
              <MetaRow label={DOCUMENT_FICHE_DATE} value={created} />
              <div>
                <dt className="sr-only">Usages</dt>
                <dd className="text-sm text-muted">{usageCaption}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}
