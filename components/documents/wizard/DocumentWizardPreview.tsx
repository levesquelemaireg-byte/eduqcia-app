"use client";

import { useFormContext } from "react-hook-form";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import { PRINTABLE_FICHE_SECTION_COPY } from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";
import { isDocumentPdfUrl } from "@/lib/documents/is-document-pdf-url";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import { DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";
import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";

type Props = {
  className?: string;
  /** Aperçu embarqué sous le formulaire (mobile) — papier un peu plus compact. */
  compact?: boolean;
};

/**
 * Aperçu « feuille » — mêmes classes que la fiche imprimable TAÉ (`printable-fiche-preview.module.css`).
 * Lit les données depuis `elements[0]` (structure éléments unifiée).
 */
export function DocumentWizardPreview({ className, compact }: Props) {
  const { watch } = useFormContext<AutonomousDocumentFormValues>();
  const titre = watch("titre");
  const elements = watch("elements");
  const el = elements?.[0];

  const docType = el?.type ?? "textuel";
  const contenu = el?.contenu;
  const imageUrl = el?.image_url;
  const imageIntrinsicW = el?.image_intrinsic_width;
  const imageIntrinsicH = el?.image_intrinsic_height;
  const imageLegende = el?.image_legende?.trim() ?? "";
  const imageLegendePosition = el?.image_legende_position;
  const source = el?.source_citation;

  const isPdf = imageUrl ? isDocumentPdfUrl(imageUrl) : false;

  return (
    <div className={cn("flex justify-center", className)}>
      <div
        className={cn(
          styles.paper,
          "max-w-full",
          compact && "origin-top scale-[0.92] max-xl:scale-100",
        )}
      >
        <article
          className={styles.documentCell}
          data-doc-type={docType}
          id="document-wizard-printable-sheet"
        >
          <p className={styles.documentHeaderLine}>
            {titre?.trim() || PRINTABLE_FICHE_SECTION_COPY.emptySlot}
          </p>
          <div className={styles.documentBody}>
            {docType === "iconographique" && imageUrl ? (
              isPdf ? (
                <div
                  className={cn(
                    "relative box-border w-full border border-border bg-surface px-3 py-4 text-xs text-muted",
                    compact ? "min-h-[120px]" : "min-h-[160px]",
                  )}
                >
                  <p>{DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW}</p>
                  {imageLegende && imageLegendePosition ? (
                    <DocumentImageLegendOverlay
                      text={imageLegende}
                      position={imageLegendePosition}
                    />
                  ) : null}
                </div>
              ) : (
                <figure className={styles.documentFigure}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL Storage / blob */}
                  <img
                    src={imageUrl}
                    alt={titre?.trim() || ""}
                    width={imageIntrinsicW ?? undefined}
                    height={imageIntrinsicH ?? undefined}
                    className={styles.documentFigureImg}
                  />
                  {imageLegende && imageLegendePosition ? (
                    <DocumentImageLegendOverlay
                      text={imageLegende}
                      position={imageLegendePosition}
                    />
                  ) : null}
                </figure>
              )
            ) : null}
            {docType === "textuel" ? (
              contenu?.trim() ? (
                <div
                  className={cn(styles.htmlFlow, "wrap-break-word")}
                  dangerouslySetInnerHTML={{
                    __html: sourceCitationDisplayHtml(contenu),
                  }}
                />
              ) : (
                PRINTABLE_FICHE_SECTION_COPY.emptySlot
              )
            ) : null}
          </div>
          {htmlHasMeaningfulText(source || "") ? (
            <div className={cn(styles.documentSource, styles.documentSourceRow)}>
              <span className={styles.documentSourceLabel}>
                {PRINTABLE_FICHE_SECTION_COPY.sourcePrefix}
              </span>
              <div
                className={cn(
                  styles.htmlFlow,
                  styles.documentSourceValue,
                  "text-[8pt] leading-snug",
                )}
                dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(source || "") }}
              />
            </div>
          ) : (
            <p className={styles.documentSource}>
              {PRINTABLE_FICHE_SECTION_COPY.sourcePrefix}
              {PRINTABLE_FICHE_SECTION_COPY.emptySlot}
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
