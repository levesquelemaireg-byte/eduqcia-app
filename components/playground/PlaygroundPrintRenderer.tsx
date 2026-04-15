"use client";

import { useMemo, useState } from "react";
import { useGrilles } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import styles from "@/components/tae/TaeForm/preview/printable-fiche-preview.module.css";
import { PRINTABLE_FICHE_SECTION_COPY } from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";
import {
  PrintableDocumentCell,
  PrintableFicheFromTaeData,
  PrintableGrilleSection,
  PrintableHtml,
} from "@/components/tae/TaeForm/preview/PrintableFichePreview";
import { shouldShowGuidageOnStudentSheet } from "@/lib/tae/consigne-helpers";
import {
  TaePrintFeuilletToggle,
  type TaePrintFeuilletId,
} from "@/components/tae/TaeForm/preview/TaePrintFeuilletToggle";
import { AvantApresPrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/AvantApresPrintableQuestionnaireCore";
import { LigneDuTempsPrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/LigneDuTempsPrintableQuestionnaireCore";
import { OrdreChronologiquePrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/OrdreChronologiquePrintableQuestionnaireCore";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import type { TaeFicheData } from "@/lib/types/fiche";
import { cn } from "@/lib/utils/cn";
import { PlaygroundFragmentWrapper } from "@/components/playground/PlaygroundFragmentWrapper";
import type { PlaygroundViewMode } from "@/lib/fragment-playground/types";

type Props = {
  tae: TaeFicheData;
  viewMode: PlaygroundViewMode;
  isolatedFragmentId: string;
};

/** Grille documents — même logique que `PrintableFicheDocumentsSection` (non exportée du module prod). */
function PlaygroundPrintDossierBody({ tae }: { tae: TaeFicheData }) {
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

/** Questionnaire — même logique que `PrintableFicheQuestionnaireSection` (non exportée du module prod). */
function PlaygroundPrintQuestionnaireBody({ tae }: { tae: TaeFicheData }) {
  const grilles = useGrilles();
  const grilleEntry = useMemo(() => {
    if (!tae.outilEvaluation || !grilles) return null;
    return grilles.find((g) => g.id === tae.outilEvaluation) ?? null;
  }, [tae, grilles]);

  const lineCount = tae.nb_lignes ?? 5;
  const showAnswerLines = tae.showStudentAnswerLines !== false;
  /** PROVISOIRE — PlaygroundPrintRenderer cassé temporairement par D0 (print-engine.md §7). */
  const variantSlug = getVariantSlugForComportementId(tae.comportement.id);
  const isOrdreChronologique = variantSlug === "ordre-chronologique";
  const isLigneDuTemps = variantSlug === "ligne-du-temps";
  const isAvantApres = variantSlug === "avant-apres";
  const structuredNonRedactionQuestionnaire =
    isOrdreChronologique || isLigneDuTemps || isAvantApres;

  return (
    <div className={styles.postDocumentsPrintGroup}>
      <section
        className={cn(styles.sectionBlock, styles.sectionTightToNext)}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.consigne}
      >
        {isOrdreChronologique ? (
          <OrdreChronologiquePrintableQuestionnaireCore
            consigneHtml={tae.consigne}
            guidageHtml={tae.guidage}
            documentSlotCount={tae.documents.length}
            showGuidageOnStudentSheet={tae.showGuidageOnStudentSheet}
          />
        ) : isLigneDuTemps ? (
          <LigneDuTempsPrintableQuestionnaireCore
            consigneHtml={tae.consigne}
            guidageHtml={tae.guidage}
            documentSlotCount={tae.documents.length}
            showGuidageOnStudentSheet={tae.showGuidageOnStudentSheet}
          />
        ) : isAvantApres ? (
          <AvantApresPrintableQuestionnaireCore
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

function PlaygroundPrintBasculeOnly() {
  const [feuillet, setFeuillet] = useState<TaePrintFeuilletId>("dossier");
  return (
    <div className={cn("printable-sheet", styles.printFeuilletRoot)}>
      <PlaygroundFragmentWrapper name="PrintBasculeFeuillets">
        <TaePrintFeuilletToggle active={feuillet} onChange={setFeuillet} />
      </PlaygroundFragmentWrapper>
      <p className="mt-3 text-[10pt] text-muted">
        Bascule dossier / questionnaire — ouvrez la vue complète pour le rendu des deux feuillets.
      </p>
    </div>
  );
}

export function PlaygroundPrintRenderer({ tae, viewMode, isolatedFragmentId }: Props) {
  if (viewMode === "full") {
    return (
      <PlaygroundFragmentWrapper name="PrintableFicheFromTaeData">
        <PrintableFicheFromTaeData tae={tae} />
      </PlaygroundFragmentWrapper>
    );
  }

  if (isolatedFragmentId === "PrintBasculeFeuillets") {
    return <PlaygroundPrintBasculeOnly />;
  }

  if (isolatedFragmentId === "PrintDossier") {
    return (
      <div className={cn("printable-sheet", styles.printFeuilletRoot)}>
        <section
          className={cn(styles.paper, "w-full max-w-full")}
          aria-label={PRINTABLE_FICHE_SECTION_COPY.documents}
        >
          <PlaygroundFragmentWrapper name="PrintDossier">
            <PlaygroundPrintDossierBody tae={tae} />
          </PlaygroundFragmentWrapper>
        </section>
      </div>
    );
  }

  if (isolatedFragmentId === "PrintQuestionnaire") {
    return (
      <div className={cn("printable-sheet", styles.printFeuilletRoot)}>
        <section
          className={cn(styles.paper, "w-full max-w-full")}
          aria-label={PRINTABLE_FICHE_SECTION_COPY.questionnaireFeuillet}
        >
          <PlaygroundFragmentWrapper name="PrintQuestionnaire">
            <PlaygroundPrintQuestionnaireBody tae={tae} />
          </PlaygroundFragmentWrapper>
        </section>
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      Fragment inconnu : {isolatedFragmentId}
    </p>
  );
}
