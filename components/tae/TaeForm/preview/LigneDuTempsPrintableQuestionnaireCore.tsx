"use client";

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

/** Consigne ligne du temps + guidage (si affiché) — rendu séquentiel (D0 : plus d'ancre). */
export function LigneDuTempsPrintableQuestionnaireCore({
  consigneHtml,
  guidageHtml,
  documentSlotCount,
  showGuidageOnStudentSheet,
}: Props) {
  const showGuidage = shouldShowGuidageOnStudentSheet(guidageHtml, showGuidageOnStudentSheet);

  return (
    <>
      <PrintableHtml html={consigneHtml} documentSlotCount={documentSlotCount} />
      {showGuidage ? (
        <div data-ligne-temps-student="true">
          <div className={cn(styles.guidageBlock, "ligne-temps-student-guidage")}>
            <PrintableHtml html={guidageHtml} documentSlotCount={documentSlotCount} />
          </div>
        </div>
      ) : null}
    </>
  );
}
