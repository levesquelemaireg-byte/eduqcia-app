"use client";

import { useMemo } from "react";
import { useGrilles } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import {
  PrintableDocumentCell,
  PrintableGrilleSection,
  PrintableHtml,
} from "@/components/tae/TaeForm/preview/PrintableFichePreview";
import { LigneDuTempsPrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/LigneDuTempsPrintableQuestionnaireCore";
import { OrdreChronologiquePrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/OrdreChronologiquePrintableQuestionnaireCore";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import {
  EVAL_PRINT_SECTION_COPY,
  PRINTABLE_FICHE_SECTION_COPY,
} from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";
import {
  flattenDocumentsWithGlobalNumbers,
  rewriteTaeHtmlDocRefsForEvaluationPrint,
} from "@/lib/evaluations/evaluation-print-doc-map";
import { shouldShowGuidageOnStudentSheet } from "@/lib/tae/consigne-helpers";
import { parseLigneDuTempsConsigneForStudentPrint } from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import { parseOrdreChronologiqueConsigneForStudentPrint } from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import type { TaeFicheData } from "@/lib/types/fiche";
import { cn } from "@/lib/utils/cn";

function PrintableEvaluationQuestionBlock({
  tae,
  taeIndex,
  fiches,
}: {
  tae: TaeFicheData;
  taeIndex: number;
  fiches: TaeFicheData[];
}) {
  const grilles = useGrilles();
  const grilleEntry = useMemo(() => {
    if (!tae.outilEvaluation || !grilles) return null;
    return grilles.find((g) => g.id === tae.outilEvaluation) ?? null;
  }, [tae.outilEvaluation, grilles]);

  const lineCount = tae.nb_lignes ?? 5;
  const consigneHtml = rewriteTaeHtmlDocRefsForEvaluationPrint(tae.consigne, taeIndex, fiches);
  const guidageHtml = rewriteTaeHtmlDocRefsForEvaluationPrint(tae.guidage, taeIndex, fiches);
  const ordreChronoAnchored = parseOrdreChronologiqueConsigneForStudentPrint(consigneHtml) !== null;
  const ligneTempsAnchored = parseLigneDuTempsConsigneForStudentPrint(consigneHtml) !== null;
  const structuredNonRedactionQuestionnaire = ordreChronoAnchored || ligneTempsAnchored;

  return (
    <div className={cn(styles.postDocumentsPrintGroup, "print:break-inside-avoid")}>
      <h3 className="mb-3 text-[11pt] font-semibold text-deep">
        {EVAL_PRINT_SECTION_COPY.questionHeading(taeIndex + 1)}
      </h3>
      <section
        className={cn(styles.sectionBlock, styles.sectionTightToNext)}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.consigne}
      >
        {ordreChronoAnchored ? (
          <OrdreChronologiquePrintableQuestionnaireCore
            consigneHtml={consigneHtml}
            guidageHtml={guidageHtml}
            documentSlotCount={tae.documents.length}
            showGuidageOnStudentSheet={tae.showGuidageOnStudentSheet}
          />
        ) : ligneTempsAnchored ? (
          <LigneDuTempsPrintableQuestionnaireCore
            consigneHtml={consigneHtml}
            guidageHtml={guidageHtml}
            documentSlotCount={tae.documents.length}
            showGuidageOnStudentSheet={tae.showGuidageOnStudentSheet}
          />
        ) : (
          <PrintableHtml html={consigneHtml} documentSlotCount={tae.documents.length} />
        )}
      </section>
      {!structuredNonRedactionQuestionnaire &&
      shouldShowGuidageOnStudentSheet(tae.guidage, tae.showGuidageOnStudentSheet) ? (
        <section className={styles.sectionBlock} aria-label={PRINTABLE_FICHE_SECTION_COPY.guidage}>
          <div className={styles.guidageBlock}>
            <PrintableHtml html={guidageHtml} documentSlotCount={tae.documents.length} />
          </div>
        </section>
      ) : null}
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

export function EvaluationPrintableBody({
  titre,
  fiches,
}: {
  titre: string;
  fiches: TaeFicheData[];
}) {
  const flatDocs = useMemo(() => flattenDocumentsWithGlobalNumbers(fiches), [fiches]);
  const hasIcono = useMemo(() => flatDocs.some((x) => x.doc.type === "iconographique"), [flatDocs]);

  return (
    <div id="tae-wizard-printable-fiche" className={cn("printable-sheet", styles.paper)}>
      <header className={cn(styles.sectionBlock, "print:break-inside-avoid")}>
        <h1 className="m-0 text-[14pt] font-semibold text-deep">{titre}</h1>
      </header>

      <section
        className={cn(styles.sectionBlock, "print:break-inside-avoid")}
        aria-label={EVAL_PRINT_SECTION_COPY.dossierDocumentaire}
      >
        <h2 className="mb-4 text-[12pt] font-semibold text-deep">
          {EVAL_PRINT_SECTION_COPY.dossierDocumentaire}
        </h2>
        {flatDocs.length === 0 ? (
          <p className="m-0 text-[10pt] text-muted">{EVAL_PRINT_SECTION_COPY.noDocuments}</p>
        ) : (
          <div className={cn(styles.docsGrid, hasIcono && styles.docsGridHasIcono)}>
            {flatDocs.map(({ globalN, doc }) => (
              <PrintableDocumentCell
                key={`eval-doc-${globalN}`}
                doc={doc}
                documentHeaderLabel={String(globalN)}
              />
            ))}
          </div>
        )}
      </section>

      <section
        className={cn(styles.sectionBlock, "mt-8")}
        aria-label={EVAL_PRINT_SECTION_COPY.questionnaire}
      >
        <h2 className="mb-4 text-[12pt] font-semibold text-deep">
          {EVAL_PRINT_SECTION_COPY.questionnaire}
        </h2>
        {fiches.length === 0 ? (
          <p className="m-0 text-[10pt] text-muted">{EVAL_PRINT_SECTION_COPY.noQuestions}</p>
        ) : (
          fiches.map((tae, taeIndex) => (
            <PrintableEvaluationQuestionBlock
              key={tae.id}
              tae={tae}
              taeIndex={taeIndex}
              fiches={fiches}
            />
          ))
        )}
      </section>
    </div>
  );
}
