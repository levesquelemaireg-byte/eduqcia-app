"use client";

import { shouldShowGuidageOnStudentSheet } from "@/lib/tae/consigne-helpers";
import { parseLigneDuTempsConsigneForStudentPrint } from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import { PrintableHtml } from "@/components/tae/TaeForm/preview/PrintableFichePreview";

type Props = {
  consigneHtml: string;
  guidageHtml: string;
  documentSlotCount: number;
  showGuidageOnStudentSheet?: boolean;
};

/** Intro + guidage (si affiché) + frise ligne du temps ; voir `parseLigneDuTempsConsigneForStudentPrint`. */
export function LigneDuTempsPrintableQuestionnaireCore({
  consigneHtml,
  guidageHtml,
  documentSlotCount,
  showGuidageOnStudentSheet,
}: Props) {
  const parts = parseLigneDuTempsConsigneForStudentPrint(consigneHtml);
  const showGuidage = shouldShowGuidageOnStudentSheet(guidageHtml, showGuidageOnStudentSheet);

  const guidageWrap = showGuidage ? (
    <div data-ligne-temps-student="true">
      <div className={cn(styles.guidageBlock, "ligne-temps-student-guidage")}>
        <PrintableHtml html={guidageHtml} documentSlotCount={documentSlotCount} />
      </div>
    </div>
  ) : null;

  if (!parts) {
    return (
      <>
        <PrintableHtml html={consigneHtml} documentSlotCount={documentSlotCount} />
        {guidageWrap}
      </>
    );
  }

  return (
    <>
      <PrintableHtml html={parts.beforeGuidage} documentSlotCount={documentSlotCount} />
      {guidageWrap}
      <PrintableHtml html={parts.afterGuidage} documentSlotCount={documentSlotCount} />
    </>
  );
}
