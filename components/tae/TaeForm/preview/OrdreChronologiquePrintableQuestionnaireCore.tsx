"use client";

import { parseOrdreChronologiqueConsigneForStudentPrint } from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import { shouldShowGuidageOnStudentSheet } from "@/lib/tae/consigne-helpers";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import { PrintableHtml } from "@/components/tae/TaeForm/preview/PrintableFichePreview";

type Props = {
  consigneHtml: string;
  guidageHtml: string;
  documentSlotCount: number;
  showGuidageOnStudentSheet?: boolean;
};

/** Intro + guidage (si affiché) + grille ordre chrono ; voir `parseOrdreChronologiqueConsigneForStudentPrint`. */
export function OrdreChronologiquePrintableQuestionnaireCore({
  consigneHtml,
  guidageHtml,
  documentSlotCount,
  showGuidageOnStudentSheet,
}: Props) {
  const parts = parseOrdreChronologiqueConsigneForStudentPrint(consigneHtml);
  const showGuidage = shouldShowGuidageOnStudentSheet(guidageHtml, showGuidageOnStudentSheet);

  const guidageWrap = showGuidage ? (
    <div data-ordre-chrono-student="true">
      <div className={cn(styles.guidageBlock, "ordre-chrono-student-guidage")}>
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
