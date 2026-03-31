"use client";

import { useMemo, useState } from "react";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { useGrilles, useOiData } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import { PRINTABLE_FICHE_SECTION_COPY } from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";
import {
  TaePrintFeuilletToggle,
  type TaePrintFeuilletId,
} from "@/components/tae/TaeForm/preview/TaePrintFeuilletToggle";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import {
  htmlHasMeaningfulText,
  resolveConsigneHtmlForDisplay,
  resolveDocRefsForPreview,
  shouldShowGuidageOnStudentSheet,
} from "@/lib/tae/consigne-helpers";
import {
  formStateToTae,
  hasFicheContent,
  type WizardFichePreviewMeta,
} from "@/lib/tae/fiche-helpers";
import type { DocumentFiche, TaeFicheData } from "@/lib/types/fiche";
import { shouldPrintDocumentFullWidth } from "@/lib/tae/print-document-full-width";
import { cn } from "@/lib/utils/cn";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";
import { LigneDuTempsPrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/LigneDuTempsPrintableQuestionnaireCore";
import { OrdreChronologiquePrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/OrdreChronologiquePrintableQuestionnaireCore";
import { parseLigneDuTempsConsigneForStudentPrint } from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import { parseOrdreChronologiqueConsigneForStudentPrint } from "@/lib/tae/non-redaction/ordre-chronologique-payload";

type WizardProps = {
  previewMeta: WizardFichePreviewMeta;
  className?: string;
};

export function PrintableHtml({
  html,
  className,
  documentSlotCount,
}: {
  html: string;
  className?: string;
  /** Résout `{{doc_*}}` en numéros 1…N pour l’aperçu (tâche seule). */
  documentSlotCount?: number;
}) {
  const resolved = resolveConsigneHtmlForDisplay(html, documentSlotCount);
  if (!hasFicheContent(resolved)) {
    return (
      <p className={cn("m-0 text-[10pt] text-muted", className)}>
        {PRINTABLE_FICHE_SECTION_COPY.emptySlot}
      </p>
    );
  }
  return (
    <div
      className={cn(styles.htmlFlow, className)}
      dangerouslySetInnerHTML={{ __html: resolved }}
    />
  );
}

export function PrintableDocumentCell({
  doc,
  documentHeaderLabel,
}: {
  doc: DocumentFiche;
  /** Ex. numéro global (impression épreuve) ; défaut : lettre A/B/C */
  documentHeaderLabel?: string;
}) {
  const titre = doc.titre.trim();
  const source = doc.source_citation;
  const bodyHtml = resolveDocRefsForPreview(doc.contenu);
  const hasTextBody = doc.type === "textuel" && hasFicheContent(bodyHtml);
  const fullWidth = shouldPrintDocumentFullWidth(doc);
  const headerLabel = documentHeaderLabel ?? doc.letter;

  return (
    <article
      className={cn(styles.documentCell, fullWidth && styles.documentCellFull)}
      data-doc-type={doc.type}
    >
      <p className={styles.documentHeaderLine}>
        Document {headerLabel} - {titre || PRINTABLE_FICHE_SECTION_COPY.emptySlot}
      </p>
      <div className={styles.documentBody}>
        {doc.type === "iconographique" && doc.image_url ? (
          <figure className={styles.documentFigure}>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob / URLs externes ; rendu print fiable */}
            <img
              src={doc.image_url}
              alt={titre || `Document ${headerLabel}`}
              width={doc.imagePixelWidth ?? undefined}
              height={doc.imagePixelHeight ?? undefined}
              className={styles.documentFigureImg}
            />
            {doc.imageLegende && doc.imageLegendePosition ? (
              <DocumentImageLegendOverlay
                text={doc.imageLegende}
                position={doc.imageLegendePosition}
              />
            ) : null}
          </figure>
        ) : null}
        {doc.type === "textuel" ? (
          hasTextBody ? (
            <div className={styles.htmlFlow} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          ) : (
            <p className="m-0 text-[10pt] text-muted">{PRINTABLE_FICHE_SECTION_COPY.emptySlot}</p>
          )
        ) : null}
        {doc.type === "iconographique" && hasFicheContent(bodyHtml) ? (
          <div
            className={cn(styles.htmlFlow, styles.htmlFlowAfterFigure)}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
      </div>
      {htmlHasMeaningfulText(source) ? (
        <div className={cn(styles.documentSource, styles.documentSourceRow)}>
          <span className={styles.documentSourceLabel}>
            {PRINTABLE_FICHE_SECTION_COPY.sourcePrefix}
          </span>
          <div
            className={cn(styles.htmlFlow, styles.documentSourceValue)}
            dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(source) }}
          />
        </div>
      ) : (
        <p className={styles.documentSource}>
          {PRINTABLE_FICHE_SECTION_COPY.sourcePrefix}
          {PRINTABLE_FICHE_SECTION_COPY.emptySlot}
        </p>
      )}
    </article>
  );
}

export function PrintableGrilleSection({
  outilEvaluation,
  grille,
  grillesLoaded,
}: {
  outilEvaluation: string | null;
  grille: GrilleEntry | null;
  grillesLoaded: boolean;
}) {
  if (!outilEvaluation) {
    return (
      <p className="m-0 text-[10pt] text-muted">{PRINTABLE_FICHE_SECTION_COPY.noGrilleTool}</p>
    );
  }
  if (!grillesLoaded) {
    return <p className="m-0 text-[10pt] text-muted">{PRINTABLE_FICHE_SECTION_COPY.emptySlot}</p>;
  }
  return (
    <div className="max-w-full overflow-x-hidden print:break-inside-avoid">
      <GrilleEvalTable entry={grille} outilEvaluationId={outilEvaluation} viewport="compact" />
    </div>
  );
}

type FromTaeProps = {
  tae: TaeFicheData;
  className?: string;
};

function PrintableFicheDocumentsSection({ tae }: { tae: TaeFicheData }) {
  const hasIcono = useMemo(
    () => tae.documents.some((d) => d.type === "iconographique"),
    [tae.documents],
  );

  return (
    <div className={styles.sectionBlock}>
      <div className={cn(styles.docsGrid, hasIcono && styles.docsGridHasIcono)}>
        {tae.documents.map((doc) => (
          <PrintableDocumentCell key={doc.letter} doc={doc} />
        ))}
      </div>
    </div>
  );
}

function PrintableFicheQuestionnaireSection({ tae }: { tae: TaeFicheData }) {
  const grilles = useGrilles();
  const grilleEntry = useMemo(() => {
    if (!tae.outilEvaluation || !grilles) return null;
    return grilles.find((g) => g.id === tae.outilEvaluation) ?? null;
  }, [tae, grilles]);

  const lineCount = tae.nb_lignes ?? 5;
  const showAnswerLines = tae.showStudentAnswerLines !== false;
  const ordreChronoAnchored = parseOrdreChronologiqueConsigneForStudentPrint(tae.consigne) !== null;
  const ligneTempsAnchored = parseLigneDuTempsConsigneForStudentPrint(tae.consigne) !== null;
  const structuredNonRedactionQuestionnaire = ordreChronoAnchored || ligneTempsAnchored;

  return (
    <div className={styles.postDocumentsPrintGroup}>
      <section
        className={cn(styles.sectionBlock, styles.sectionTightToNext)}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.consigne}
      >
        {ordreChronoAnchored ? (
          <OrdreChronologiquePrintableQuestionnaireCore
            consigneHtml={tae.consigne}
            guidageHtml={tae.guidage}
            documentSlotCount={tae.documents.length}
            showGuidageOnStudentSheet={tae.showGuidageOnStudentSheet}
          />
        ) : ligneTempsAnchored ? (
          <LigneDuTempsPrintableQuestionnaireCore
            consigneHtml={tae.consigne}
            guidageHtml={tae.guidage}
            documentSlotCount={tae.documents.length}
            showGuidageOnStudentSheet={tae.showGuidageOnStudentSheet}
          />
        ) : (
          <PrintableHtml html={tae.consigne} documentSlotCount={tae.documents.length} />
        )}
      </section>

      {!structuredNonRedactionQuestionnaire &&
      shouldShowGuidageOnStudentSheet(tae.guidage, tae.showGuidageOnStudentSheet) ? (
        <section className={styles.sectionBlock} aria-label={PRINTABLE_FICHE_SECTION_COPY.guidage}>
          <div className={styles.guidageBlock}>
            <PrintableHtml html={tae.guidage} documentSlotCount={tae.documents.length} />
          </div>
        </section>
      ) : null}

      {showAnswerLines ? (
        <section
          className={styles.sectionBlock}
          aria-label={PRINTABLE_FICHE_SECTION_COPY.answerSectionAria(lineCount)}
        >
          <ul className={styles.answerLines} role="presentation">
            {Array.from({ length: lineCount }, (_, i) => (
              <li key={i} className={styles.answerLine} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.sectionBlock} aria-label={PRINTABLE_FICHE_SECTION_COPY.grille}>
        <PrintableGrilleSection
          outilEvaluation={tae.outilEvaluation}
          grille={grilleEntry}
          grillesLoaded={grilles !== null}
        />
      </section>
    </div>
  );
}

/**
 * Contenu imprimable à partir d’une fiche persistée (lecture) — même mise en page que le wizard.
 * Deux feuillets (dossier documentaire / questionnaire) : aperçu écran avec bascule ; impression des deux.
 */
export function PrintableFicheFromTaeData({ tae, className }: FromTaeProps) {
  const [feuillet, setFeuillet] = useState<TaePrintFeuilletId>("dossier");

  return (
    <div
      id="tae-wizard-printable-fiche"
      className={cn("printable-sheet", styles.printFeuilletRoot, className)}
    >
      <TaePrintFeuilletToggle active={feuillet} onChange={setFeuillet} />
      <section
        className={cn(
          styles.paper,
          styles.feuilletDossierPane,
          feuillet !== "dossier" && styles.feuilletPaneScreenHidden,
        )}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.documents}
      >
        <PrintableFicheDocumentsSection tae={tae} />
      </section>
      <section
        className={cn(
          styles.paper,
          feuillet !== "questionnaire" && styles.feuilletPaneScreenHidden,
        )}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.questionnaireFeuillet}
      >
        <PrintableFicheQuestionnaireSection tae={tae} />
      </section>
    </div>
  );
}

/**
 * Aperçu impression wizard — `useTaeForm` + `formStateToTae`.
 */
export function PrintableFichePreview({ previewMeta, className }: WizardProps) {
  const { state } = useTaeForm();
  const { oiList } = useOiData();

  const tae = useMemo(() => {
    if (!oiList || oiList.length === 0) return null;
    return formStateToTae(state, oiList, previewMeta);
  }, [state, oiList, previewMeta]);

  if (!tae) {
    return (
      <div
        id="tae-wizard-printable-fiche"
        className={cn("printable-sheet", styles.printFeuilletRoot, className)}
        aria-busy="true"
        aria-label="Chargement de l’aperçu"
      >
        <div className={cn(styles.paper, "w-full max-w-full")} aria-hidden="true">
          <div className="h-40 w-full animate-pulse rounded-lg bg-border/40" />
        </div>
      </div>
    );
  }

  return <PrintableFicheFromTaeData tae={tae} className={className} />;
}
