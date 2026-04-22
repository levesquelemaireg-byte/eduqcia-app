"use client";

import { useMemo, useState } from "react";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import { useGrilles, useOiData } from "@/components/tache/wizard/bloc2/useBloc2Data";
import type { GrilleEntry } from "@/components/tache/wizard/bloc2/types";
import styles from "@/components/tache/wizard/preview/printable-fiche-preview.module.css";
import { PRINTABLE_FICHE_SECTION_COPY } from "@/components/tache/wizard/preview/wizard-print-preview-copy";
import {
  TaePrintFeuilletToggle,
  type TaePrintFeuilletId,
} from "@/components/tache/wizard/preview/TaePrintFeuilletToggle";
import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
import { documentFicheVersRenderer } from "@/lib/documents/document-fiche-vers-renderer";
import {
  resolveConsigneHtmlForDisplay,
  shouldShowGuidageOnStudentSheet,
} from "@/lib/tache/consigne-helpers";
import { sanitize } from "@/lib/fiche/helpers";
import { hasFicheContent, type WizardFichePreviewMeta } from "@/lib/tache/fiche-helpers";
import {
  etatWizardVersTache,
  type GrilleEvaluationEntree,
} from "@/lib/tache/contrats/etat-wizard-vers-tache";
import { getSlotData, slotLetter } from "@/lib/tache/document-helpers";
import { isActiveNonRedactionVariant } from "@/lib/tache/non-redaction/wizard-variant";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import type { DocumentFiche, TaeFicheData } from "@/lib/types/fiche";
import { cn } from "@/lib/utils/cn";
import { GrilleEvalTable } from "@/components/tache/grilles/GrilleEvalTable";
import { AvantApresPrintableQuestionnaireCore } from "@/components/tache/wizard/preview/AvantApresPrintableQuestionnaireCore";
import { LigneDuTempsPrintableQuestionnaireCore } from "@/components/tache/wizard/preview/LigneDuTempsPrintableQuestionnaireCore";
import { OrdreChronologiquePrintableQuestionnaireCore } from "@/components/tache/wizard/preview/OrdreChronologiquePrintableQuestionnaireCore";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE } from "@/lib/ui/ui-copy";

type WizardProps = {
  previewMeta: WizardFichePreviewMeta;
  className?: string;
  /** Variante de composition (formatif / sommatif standard / ministérielle). */
  mode?: ModeImpression;
  /** Affiche la vue corrigée (consigne + corrigé uniquement). */
  estCorrige?: boolean;
  /** Feuillet contrôlé (PreviewPanel). Si fourni, le toggle interne est masqué. */
  feuillet?: TaePrintFeuilletId;
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
      dangerouslySetInnerHTML={{ __html: sanitize(resolved) }}
    />
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
  mode?: ModeImpression;
  estCorrige?: boolean;
  /** Feuillet contrôlé de l'extérieur (PreviewPanel). Si fourni, pas de toggle interne. */
  feuillet?: TaePrintFeuilletId;
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
          <DocumentCardPrint key={doc.letter} document={documentFicheVersRenderer(doc)} />
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

function PrintableFicheCorrigeSection({ tae }: { tae: TaeFicheData }) {
  return (
    <div className={styles.postDocumentsPrintGroup}>
      <section
        className={cn(styles.sectionBlock, styles.sectionTightToNext)}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.consigne}
      >
        <PrintableHtml html={tae.consigne} documentSlotCount={tae.documents.length} />
      </section>

      <section className={styles.sectionBlock} aria-label={FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE}>
        <PrintableHtml html={tae.corrige} documentSlotCount={tae.documents.length} />
      </section>
    </div>
  );
}

/**
 * Contenu imprimable à partir d’une fiche persistée (lecture) — même mise en page que le wizard.
 * Deux feuillets (dossier documentaire / questionnaire) : aperçu écran avec bascule ; impression des deux.
 */
export function PrintableFicheFromTaeData({
  tae,
  className,
  mode = "sommatif-standard",
  estCorrige = false,
  feuillet: controlledFeuillet,
}: FromTaeProps) {
  const [internalFeuillet, setInternalFeuillet] = useState<TaePrintFeuilletId>("dossier");
  const isControlled = controlledFeuillet != null;
  const activeFeuillet = isControlled ? controlledFeuillet : internalFeuillet;

  if (estCorrige) {
    return (
      <div
        id="tae-wizard-printable-fiche"
        className={cn("printable-sheet", styles.printFeuilletRoot, className)}
      >
        <section className={cn(styles.paper)} aria-label={FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE}>
          <PrintableFicheCorrigeSection tae={tae} />
        </section>
      </div>
    );
  }

  if (mode === "formatif") {
    return (
      <div
        id="tae-wizard-printable-fiche"
        className={cn("printable-sheet", styles.printFeuilletRoot, className)}
      >
        <section
          className={cn(styles.paper)}
          aria-label={PRINTABLE_FICHE_SECTION_COPY.questionnaireFeuillet}
        >
          <PrintableFicheDocumentsSection tae={tae} />
          <PrintableFicheQuestionnaireSection tae={tae} />
        </section>
      </div>
    );
  }

  return (
    <div
      id="tae-wizard-printable-fiche"
      className={cn("printable-sheet", styles.printFeuilletRoot, className)}
    >
      {!isControlled ? (
        <TaePrintFeuilletToggle active={activeFeuillet} onChange={setInternalFeuillet} />
      ) : null}
      <section
        className={cn(
          styles.paper,
          styles.feuilletDossierPane,
          activeFeuillet !== "dossier" && styles.feuilletPaneScreenHidden,
        )}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.documents}
      >
        <PrintableFicheDocumentsSection tae={tae} />
      </section>
      <section
        className={cn(
          styles.paper,
          activeFeuillet !== "questionnaire" && styles.feuilletPaneScreenHidden,
        )}
        aria-label={PRINTABLE_FICHE_SECTION_COPY.questionnaireFeuillet}
      >
        <PrintableFicheQuestionnaireSection tae={tae} />
      </section>
    </div>
  );
}

/**
 * Aperçu impression wizard — `etatWizardVersTache` + adaptateur local vers `TaeFicheData`.
 */
export function PrintableFichePreview({
  previewMeta,
  className,
  mode = "sommatif-standard",
  estCorrige = false,
  feuillet,
}: WizardProps) {
  const { state } = useTaeForm();
  const { oiList } = useOiData();
  const grilles = useGrilles();

  const tae = useMemo(() => {
    if (!oiList || oiList.length === 0) return null;
    if (!grilles) return null;

    const grillesEntrees: GrilleEvaluationEntree[] = grilles.map((g) => ({
      id: g.id,
      oi: g.operation,
      comportement_enonce: g.comportement_enonce,
      bareme: g.bareme,
    }));

    const donnees = etatWizardVersTache(state, oiList, grillesEntrees, previewMeta);

    /* Documents : DonneesTache.documents est trop léger pour le rendu
       (pas d'image_url, source_citation, etc.). On construit DocumentFiche[]
       depuis les slots du wizard — identique à l'ancien formStateToTae. */
    const documents: DocumentFiche[] = state.bloc2.documentSlots.map(({ slotId }) => {
      const slot = getSlotData(state.bloc4.documents, slotId);
      const legendTrim = slot.image_legende.trim();
      const hasLegend = legendTrim.length > 0;
      const pos = slot.image_legende_position;
      return {
        letter: slotLetter(slotId),
        titre: slot.titre,
        contenu: slot.contenu,
        source_citation: slot.source_citation,
        type: slot.type,
        image_url: slot.imageUrl,
        imagePixelWidth: slot.imagePixelWidth,
        imagePixelHeight: slot.imagePixelHeight,
        imageLegende: hasLegend ? legendTrim : null,
        imageLegendePosition: hasLegend && pos ? pos : null,
      };
    });

    /* Adaptateur DonneesTache → TaeFicheData (provisoire — D0 print-engine §7). */
    const taeFiche: TaeFicheData = {
      id: donnees.id,
      auteur_id: donnees.auteur_id,
      auteurs: donnees.auteurs,
      consigne: donnees.consigne,
      guidage: donnees.guidage?.content ?? "",
      corrige: donnees.corrige,
      aspects_societe: donnees.aspects_societe,
      nb_lignes: donnees.nb_lignes,
      showStudentAnswerLines: !isActiveNonRedactionVariant(state),
      showGuidageOnStudentSheet: mode === "formatif" && !estCorrige ? undefined : false,
      niveau: donnees.niveau,
      discipline: donnees.discipline,
      oi: donnees.oi,
      comportement: donnees.comportement,
      outilEvaluation: state.bloc2.outilEvaluation,
      cd: donnees.cd,
      connaissances: donnees.connaissances,
      documents,
      version: donnees.version,
      version_updated_at: donnees.version_updated_at,
      is_published: donnees.is_published,
      created_at: donnees.created_at,
      updated_at: donnees.updated_at,
    };

    return taeFiche;
  }, [state, oiList, grilles, previewMeta, mode, estCorrige]);

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

  return (
    <PrintableFicheFromTaeData
      tae={tae}
      className={className}
      mode={mode}
      estCorrige={estCorrige}
      feuillet={feuillet}
    />
  );
}
