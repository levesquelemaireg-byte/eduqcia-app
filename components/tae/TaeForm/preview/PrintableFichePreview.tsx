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
import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import {
  htmlHasMeaningfulText,
  resolveConsigneHtmlForDisplay,
  resolveDocRefsForPreview,
  shouldShowGuidageOnStudentSheet,
} from "@/lib/tae/consigne-helpers";
import { sanitize } from "@/lib/fiche/helpers";
import { hasFicheContent, type WizardFichePreviewMeta } from "@/lib/tae/fiche-helpers";
import {
  etatWizardVersTache,
  type GrilleEvaluationEntree,
} from "@/lib/tache/contrats/etat-wizard-vers-tache";
import { getSlotData, slotLetter } from "@/lib/tae/document-helpers";
import { isActiveNonRedactionVariant } from "@/lib/tae/non-redaction/wizard-variant";
import type { DocumentFiche, TaeFicheData } from "@/lib/types/fiche";
import { shouldPrintDocumentFullWidth } from "@/lib/tae/print-document-full-width";
import { cn } from "@/lib/utils/cn";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import { DocumentImageLegendOverlay } from "@/components/documents/DocumentImageLegendOverlay";
import { AvantApresPrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/AvantApresPrintableQuestionnaireCore";
import { LigneDuTempsPrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/LigneDuTempsPrintableQuestionnaireCore";
import { OrdreChronologiquePrintableQuestionnaireCore } from "@/components/tae/TaeForm/preview/OrdreChronologiquePrintableQuestionnaireCore";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";

type WizardProps = {
  previewMeta: WizardFichePreviewMeta;
  className?: string;
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

export function PrintableDocumentCell({
  doc,
  documentHeaderLabel,
}: {
  doc: DocumentFiche;
  /** Ex. numéro global (impression épreuve) ; défaut : lettre A/B/C */
  documentHeaderLabel?: string;
}) {
  const titre = doc.titre.trim();
  const fullWidth = shouldPrintDocumentFullWidth(doc);
  const headerLabel = documentHeaderLabel ?? doc.letter;
  const rd = doc.rendererDocument;

  // Multi-éléments (perspectives, deux_temps) — rendu via DocumentElementRenderer
  if (rd && rd.elements.length > 1) {
    const showAuteur = rd.structure === "perspectives";
    const showRepereTemporel = rd.structure === "deux_temps";
    return (
      <article
        className={cn(styles.documentWrapper, styles.documentCellFull)}
        data-doc-type={doc.type}
      >
        <div className={styles.documentHeader}>
          <div className={styles.documentNumero} aria-label={`Document ${headerLabel}`}>
            {headerLabel}
          </div>
          <p className={styles.documentHeaderLine}>
            {titre || PRINTABLE_FICHE_SECTION_COPY.emptySlot}
          </p>
        </div>
        <div className={styles.documentCell}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${rd.elements.length}, 1fr)`,
              margin: "-0.4rem -0.5rem",
            }}
          >
            {rd.elements.map((el) => (
              <div
                key={el.id}
                className="border-l border-l-[#333] px-2 py-[0.4rem] first:border-l-0"
              >
                <DocumentElementRenderer
                  element={el}
                  showAuteur={showAuteur}
                  showRepereTemporel={showRepereTemporel}
                  hideSource
                />
              </div>
            ))}
          </div>
        </div>
        {rd.elements.length === 1 ? (
          <PrintableSourceLine source={rd.elements[0].source} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${rd.elements.length}, 1fr)`,
            }}
          >
            {rd.elements.map((el) => (
              <PrintableSourceLine key={el.id} source={el.source} />
            ))}
          </div>
        )}
      </article>
    );
  }

  // Simple (un seul élément) — rendu flat historique
  const source = doc.source_citation;
  const bodyHtml = resolveDocRefsForPreview(doc.contenu);
  const hasTextBody = doc.type === "textuel" && hasFicheContent(bodyHtml);

  return (
    <article
      className={cn(styles.documentWrapper, fullWidth && styles.documentCellFull)}
      data-doc-type={doc.type}
    >
      <div className={styles.documentHeader}>
        <div className={styles.documentNumero} aria-label={`Document ${headerLabel}`}>
          {headerLabel}
        </div>
        <p className={styles.documentHeaderLine}>
          {titre || PRINTABLE_FICHE_SECTION_COPY.emptySlot}
        </p>
      </div>
      <div className={styles.documentCell}>
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
              <div
                className={styles.htmlFlow}
                dangerouslySetInnerHTML={{ __html: sanitize(bodyHtml) }}
              />
            ) : (
              <p className="m-0 text-[10pt] text-muted">{PRINTABLE_FICHE_SECTION_COPY.emptySlot}</p>
            )
          ) : null}
          {doc.type === "iconographique" && hasFicheContent(bodyHtml) ? (
            <div
              className={cn(styles.htmlFlow, styles.htmlFlowAfterFigure)}
              dangerouslySetInnerHTML={{ __html: sanitize(bodyHtml) }}
            />
          ) : null}
        </div>
      </div>
      <PrintableSourceLine source={source} />
    </article>
  );
}

function PrintableSourceLine({ source }: { source: string }) {
  if (htmlHasMeaningfulText(source)) {
    return (
      <div
        className={cn(styles.documentSource, styles.htmlFlow, styles.documentSourceValue)}
        dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(source) }}
      />
    );
  }
  return <p className={styles.documentSource}>{PRINTABLE_FICHE_SECTION_COPY.emptySlot}</p>;
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

/**
 * Contenu imprimable à partir d’une fiche persistée (lecture) — même mise en page que le wizard.
 * Deux feuillets (dossier documentaire / questionnaire) : aperçu écran avec bascule ; impression des deux.
 */
export function PrintableFicheFromTaeData({
  tae,
  className,
  feuillet: controlledFeuillet,
}: FromTaeProps) {
  const [internalFeuillet, setInternalFeuillet] = useState<TaePrintFeuilletId>("dossier");
  const isControlled = controlledFeuillet != null;
  const activeFeuillet = isControlled ? controlledFeuillet : internalFeuillet;

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
export function PrintableFichePreview({ previewMeta, className, feuillet }: WizardProps) {
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
        printImpressionScale: 1,
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
      showGuidageOnStudentSheet: undefined,
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
  }, [state, oiList, grilles, previewMeta]);

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

  return <PrintableFicheFromTaeData tae={tae} className={className} feuillet={feuillet} />;
}
