"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { formValuesToDocFicheData } from "@/lib/fiche/adapters/form-to-doc-fiche-data";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DisciplineOption, NiveauOption } from "@/lib/queries/document-ref-data";
import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { PeriodeIcon } from "@/components/ui/PeriodeIcon";
import { StatusBadge } from "@/lib/fiche/primitives/MetaRow";
import { cn } from "@/lib/utils/cn";
import {
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOC_STRUCTURE_SIMPLE_TITLE,
  DOC_STRUCTURE_PERSPECTIVES_TITLE,
  DOC_STRUCTURE_DEUX_TEMPS_TITLE,
} from "@/lib/ui/ui-copy";
import {
  getDocumentCategorieIconographique,
  getDocumentCategorieTextuelle,
} from "@/lib/tae/document-categories-helpers";

type Props = {
  step: number;
  niveaux: NiveauOption[];
  disciplines: DisciplineOption[];
  authorName?: string;
};

/**
 * Sommaire détaillé du document dans le wizard — SPEC-SOMMAIRE-DOCUMENT §2.
 * Mirror vivant du formulaire, layout 2 colonnes, pulse sur la section active.
 */
export function DocumentWizardPreview({ step, niveaux, disciplines, authorName }: Props) {
  const { watch } = useFormContext<AutonomousDocumentFormValues>();
  const values = watch();

  const data = useMemo(
    () => formValuesToDocFicheData(values, { niveaux, disciplines, authorName }),
    [values, niveaux, disciplines, authorName],
  );

  const firstElement = data.document.elements[0];
  const isTextuel = firstElement?.type === "textuel";
  const typeLabel = isTextuel ? DOCUMENT_MODULE_TYPE_TEXT : DOCUMENT_MODULE_TYPE_IMAGE;
  const typeIcon = isTextuel ? "article" : "image_inset";
  const structureLabel = getStructureLabel(data.document.structure);
  const structureIcon = data.document.structure === "simple" ? "crop_square" : "view_column_2";
  const periodeLabel = values.connaissances_miller[0]?.realite_sociale ?? "";

  const categorieInfo = getCategorieInfo(firstElement);
  const aspectsList = data.aspectsStr ? data.aspectsStr.split(", ").filter(Boolean) : [];

  const highlightContenu = step === 1;
  const highlightClassification = step === 2;

  return (
    <div className="mx-auto flex w-full max-w-270 flex-col gap-6 px-2 py-4 sm:px-4 md:py-6">
      {/* Header : statut + titre + sub-chips */}
      <header className="space-y-3">
        <StatusBadge label="Brouillon" variant="draft" />
        <h1
          className="text-[24px] font-semibold leading-[1.2] tracking-[-0.025em] text-deep"
          style={{ letterSpacing: "-0.025em" }}
        >
          {data.document.titre || "Sans titre"}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-deep">
          <SubChip icon={typeIcon} label={typeLabel} />
          <SubChip icon={structureIcon} label={structureLabel} />
          {periodeLabel ? (
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
              <PeriodeIcon />
              <span className="ml-1">{periodeLabel}</span>
            </span>
          ) : null}
        </div>
      </header>

      {/* Grille 2 colonnes */}
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
        style={{ gap: "24px" }}
      >
        {/* Colonne gauche — Contenu + Connaissances */}
        <div className="space-y-4">
          <section
            className={cn("rounded-lg", highlightContenu && "doc-sommaire-zone-highlighted")}
            aria-live={highlightContenu ? "polite" : undefined}
          >
            <SectionLabel icon={null} label="Contenu du document" />
            <DocContenuCard document={data.document} />
          </section>

          {data.connLabels ? (
            <section className="rounded-lg">
              <SectionLabel icon="lightbulb" label="Connaissances" />
              <ConnaissancesTree items={values.connaissances_miller} />
            </section>
          ) : null}
        </div>

        {/* Colonne droite — 3 groupes de badges */}
        <div className="space-y-3.5">
          {/* Groupe 1 : Classification pédagogique */}
          <section
            className={cn(
              "flex flex-wrap items-start gap-2 rounded-lg",
              highlightClassification && "doc-sommaire-zone-highlighted",
            )}
            aria-live={highlightClassification ? "polite" : undefined}
          >
            {data.niveauLabels ? <MetaBadge icon="school" label={data.niveauLabels} /> : null}
            {data.disciplineLabels ? (
              <MetaBadge icon="menu_book" label={data.disciplineLabels} />
            ) : null}
            {aspectsList.length > 0 ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
                <span
                  className="material-symbols-outlined text-[0.9em] text-accent"
                  aria-hidden="true"
                >
                  deployed_code
                </span>
                {aspectsList.map((aspect, i) => (
                  <span key={aspect} className="flex items-center gap-1">
                    {i > 0 ? <span className="text-muted">·</span> : null}
                    <span>{aspect}</span>
                  </span>
                ))}
              </span>
            ) : null}
          </section>

          {/* Groupe 2 : Référencement */}
          <section className="flex flex-wrap items-start gap-2">
            <SourceBadge sourceType={firstElement?.sourceType ?? "secondaire"} />
            {categorieInfo ? (
              <MetaBadge icon={categorieInfo.icon} label={categorieInfo.label} />
            ) : null}
            {values.repere_temporel?.trim() ? (
              <MetaBadge icon="anchor" label={values.repere_temporel.trim()} />
            ) : null}
          </section>

          {/* Groupe 3 : Informations */}
          {authorName ? (
            <section className="flex flex-wrap items-start gap-2">
              <MetaBadge icon="person" label={authorName} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Sous-composants ────────────────────────────────────── */

function SubChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
      <span className="material-symbols-outlined text-[0.9em] text-accent" aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}

function MetaBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
      <span className="material-symbols-outlined text-[0.9em] text-accent" aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}

function SourceBadge({ sourceType }: { sourceType: "primaire" | "secondaire" }) {
  const label = sourceType === "primaire" ? "Primaire" : "Secondaire";
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs text-deep">
      <span className="font-bold">Source</span>
      <span className="font-normal">{label}</span>
    </span>
  );
}

function SectionLabel({ icon, label }: { icon: string | null; label: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-muted">
      {icon ? (
        <span className="material-symbols-outlined text-[1em] text-accent" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </div>
  );
}

function DocContenuCard({
  document,
}: {
  document: ReturnType<typeof formValuesToDocFicheData>["document"];
}) {
  const firstEl = document.elements[0];
  const source = firstEl?.source;

  return (
    <div className="rounded-lg bg-panel-alt p-3.5">
      {document.elements.length > 1 ? (
        <div className="space-y-3">
          {document.elements.map((el) => (
            <div key={el.id} className="border-t border-border/70 pt-3 first:border-t-0 first:pt-0">
              <DocumentElementRenderer element={el} showAuteur hideSource />
            </div>
          ))}
        </div>
      ) : firstEl ? (
        <DocumentElementRenderer element={firstEl} hideSource />
      ) : (
        <p className="text-xs italic text-muted">Aucun contenu saisi.</p>
      )}

      {source ? (
        <div className="mt-3 border-t border-dashed border-border pt-2 text-[11px] italic text-steel">
          <span className="not-italic font-bold uppercase tracking-wider text-muted">Source</span>
          {" · "}
          <span
            className="inline [&>p]:m-0 [&>p]:inline"
            dangerouslySetInnerHTML={{
              __html: sourceCitationDisplayHtml(source),
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ConnaissancesTree({
  items,
}: {
  items: AutonomousDocumentFormValues["connaissances_miller"];
}) {
  if (items.length === 0) return null;
  const first = items[0]!;
  return (
    <div className="text-[12.5px] leading-[1.4]">
      <p className="py-1.5 font-semibold text-deep">{first.section || first.realite_sociale}</p>
      {first.sous_section ? (
        <p className="border-l border-border py-1.5 pl-5 font-medium text-steel">
          {first.sous_section}
        </p>
      ) : null}
      <p className="border-l border-border py-1.5 pl-10 text-steel">{first.enonce}</p>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function getStructureLabel(structure: string): string {
  if (structure === "perspectives") return DOC_STRUCTURE_PERSPECTIVES_TITLE;
  if (structure === "deux_temps") return DOC_STRUCTURE_DEUX_TEMPS_TITLE;
  return DOC_STRUCTURE_SIMPLE_TITLE;
}

function getCategorieInfo(
  el: ReturnType<typeof formValuesToDocFicheData>["document"]["elements"][number] | undefined,
): { icon: string; label: string } | null {
  if (!el) return null;
  if (el.type === "textuel") {
    const found = getDocumentCategorieTextuelle(el.categorieTextuelle);
    return found ? { icon: found.icon, label: found.label } : null;
  }
  const found = getDocumentCategorieIconographique(el.categorieIconographique);
  return found ? { icon: found.icon, label: found.label } : null;
}
