"use client";

import { shouldShowGuidageOnStudentSheet } from "@/lib/tache/consigne-helpers";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/tache/wizard/preview/printable-fiche-preview.module.css";
import { PrintableHtml } from "@/components/tache/wizard/preview/PrintableFichePreview";

type Props = {
  consigneHtml: string;
  guidageHtml: string;
  documentSlotCount: number;
  showGuidageOnStudentSheet?: boolean;
};

/** Consigne avant / après + guidage (si affiché) — rendu séquentiel (D0 : plus d'ancre). */
export function AvantApresPrintableQuestionnaireCore({
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
        <div data-avant-apres-student="true">
          <div className={cn(styles.guidageBlock, "avant-apres-student-guidage")}>
            <PrintableHtml html={guidageHtml} documentSlotCount={documentSlotCount} />
          </div>
        </div>
      ) : null}
    </>
  );
}
