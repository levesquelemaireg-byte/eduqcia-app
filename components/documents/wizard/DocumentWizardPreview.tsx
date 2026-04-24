"use client";

import { useFormContext } from "react-hook-form";
import { DocumentElementRenderer } from "@/components/document/renderer/element-renderer";
import { PeriodeIcon } from "@/components/ui/PeriodeIcon";
import { SkeletonLine, SkeletonRect } from "@/components/ui/SkeletonLine";
import { useIsFieldActive } from "@/components/documents/wizard/active-field-context";
import { StatusBadge } from "@/lib/fiche/primitives/MetaRow";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { refIdsEqual } from "@/lib/documents/ref-id";
import {
  getDocumentCategorieIconographique,
  getDocumentCategorieTextuelle,
} from "@/lib/tache/document-categories-helpers";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import { iconForDocumentStructure } from "@/lib/ui/icons/document-structure-icon";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DisciplineOption, NiveauOption } from "@/lib/queries/document-ref-data";
import type {
  RendererDocument,
  DocumentElement,
  TextuelElement,
  IconographiqueElement,
} from "@/lib/types/document-renderer";
import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";
import {
  DOCUMENT_MODULE_ASPECTS_LABEL,
  DOCUMENT_MODULE_INDEX_DISCIPLINE,
  DOCUMENT_MODULE_INDEX_NIVEAU,
  DOCUMENT_MODULE_SOURCE_TYPE_LABEL,
  DOCUMENT_MODULE_TITRE_LABEL,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOC_STRUCTURE_DEUX_TEMPS_TITLE,
  DOC_STRUCTURE_PERSPECTIVES_TITLE,
  DOC_STRUCTURE_SIMPLE_TITLE,
  ANCRAGE_TEMPOREL_LABEL,
  DOCUMENT_WIZARD_TYPE_DOC_LABEL,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  step?: number;
  niveaux: NiveauOption[];
  disciplines: DisciplineOption[];
  authorName?: string;
};

/**
 * Sommaire détaillé du document dans le wizard — SPEC-SOMMAIRE-DOCUMENT §2 + §2.10.
 * Miroir vivant : badges en état placeholder quand le champ n'est pas saisi,
 * pulse granulaire sur l'élément correspondant au champ en focus dans le wizard.
 */
export function DocumentWizardPreview({ niveaux, disciplines, authorName }: Props) {
  const { watch } = useFormContext<AutonomousDocumentFormValues>();
  const values = watch();

  const firstElement = values.elements[0];
  const docType = firstElement?.type ?? null;
  const structure = values.structure;

  const niveauLabel = niveaux.find((n) => refIdsEqual(n.id, values.niveau_id))?.label?.trim() ?? "";
  const disciplineLabel =
    disciplines.find((d) => refIdsEqual(d.id, values.discipline_id))?.label?.trim() ?? "";

  const aspectLabels = aspectsList(values.aspects);
  const periodeLabel = values.connaissances_miller[0]?.realite_sociale?.trim() ?? "";
  const repereTemporel = values.repere_temporel?.trim() ?? "";
  const titre = values.titre?.trim() ?? "";

  const categorieInfo = getCategorieInfoFromForm(firstElement);
  const sourceTypeValue = firstElement?.source_type ?? null;

  const hasContenu =
    docType === "textuel"
      ? htmlHasMeaningfulText(firstElement?.contenu ?? "")
      : docType === "iconographique"
        ? Boolean(firstElement?.image_url?.trim())
        : false;
  const hasSource = htmlHasMeaningfulText(firstElement?.source_citation ?? "");
  const hasConnaissances = values.connaissances_miller.length > 0;

  const contenuActive = useIsFieldActive(docType === "iconographique" ? "image" : "contenu");
  const sourceCitationActive = useIsFieldActive("source_citation");
  const imageLegendeActive = useIsFieldActive("image_legende");
  const connaissancesActive = useIsFieldActive("connaissances");

  const rendererDoc: RendererDocument | null = hasContenu ? buildRendererDocument(values) : null;
  const rendererFirstEl = rendererDoc?.elements[0];

  return (
    <div className="mx-auto flex w-full max-w-270 flex-col gap-6 px-2 py-4 sm:px-4 md:py-6">
      {/* Header : statut + titre + sub-chips */}
      <header className="space-y-3">
        <StatusBadge label="Brouillon" variant="draft" />
        <DocTitle value={titre} />
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-deep">
          <TypeChip docType={docType} />
          <StructureChip structure={structure} elementCount={values.elements.length} />
          <PeriodeChip label={periodeLabel} />
        </div>
      </header>

      {/* Grille 2 colonnes */}
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
        style={{ gap: "24px" }}
      >
        {/* Colonne gauche — Contenu + Connaissances */}
        <div className="space-y-4">
          <section>
            <SectionLabel icon={null} label="Contenu du document" />
            <div
              className={cn(
                "doc-sommaire-element rounded-lg bg-panel-alt p-3.5",
                (contenuActive || sourceCitationActive || imageLegendeActive) && "is-focused",
              )}
            >
              <DocContenuCard
                docType={docType}
                hasContenu={hasContenu}
                rendererFirstEl={rendererFirstEl}
                imageUrl={firstElement?.image_url?.trim() ?? ""}
              />
              <DocSourceFooter
                hasSource={hasSource}
                sourceHtml={firstElement?.source_citation ?? ""}
              />
            </div>
          </section>

          <section>
            <SectionLabel icon={ICONES_METIER.connaissances} label="Connaissances" />
            <div
              className={cn(
                "doc-sommaire-element rounded-lg p-2",
                connaissancesActive && "is-focused",
              )}
            >
              <ConnaissancesTree
                items={values.connaissances_miller}
                hasConnaissances={hasConnaissances}
              />
            </div>
          </section>
        </div>

        {/* Colonne droite — 3 groupes de badges */}
        <div className="space-y-3.5">
          {/* Groupe 1 : Classification pédagogique */}
          <section className="flex flex-wrap items-start gap-2">
            <MetaBadge
              fieldKey="niveaux"
              icon={ICONES_METIER.niveau}
              value={niveauLabel}
              placeholder={`${DOCUMENT_MODULE_INDEX_NIVEAU} scolaire`}
            />
            <MetaBadge
              fieldKey="disciplines"
              icon={ICONES_METIER.discipline}
              value={disciplineLabel}
              placeholder={DOCUMENT_MODULE_INDEX_DISCIPLINE}
            />
            <AspectsBadge aspects={aspectLabels} />
          </section>

          {/* Groupe 2 : Référencement */}
          <section className="flex flex-wrap items-start gap-2">
            <SourceTypeBadge value={sourceTypeValue} />
            <CategorieBadge docType={docType} info={categorieInfo} />
            <MetaBadge
              fieldKey="repere_temporel"
              icon={ICONES_METIER.ancrageTemporel}
              value={repereTemporel}
              placeholder={ANCRAGE_TEMPOREL_LABEL}
            />
          </section>

          {/* Groupe 3 : Informations */}
          <section className="flex flex-wrap items-start gap-2">
            <AuteurBadge name={authorName ?? ""} />
            <DateCreationBadge />
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─── Sous-composants ─────────────────────────────────────── */

function DocTitle({ value }: { value: string }) {
  const focused = useIsFieldActive("titre");
  const isEmpty = !value;
  return (
    <h1
      className={cn(
        "doc-sommaire-title text-[24px] font-semibold leading-[1.2] tracking-[-0.025em] text-deep",
        isEmpty && "is-empty",
        focused && "is-focused",
      )}
      style={{ letterSpacing: "-0.025em" }}
    >
      {value || DOCUMENT_MODULE_TITRE_LABEL}
    </h1>
  );
}

function TypeChip({ docType }: { docType: "textuel" | "iconographique" | null }) {
  const focused = useIsFieldActive("type");
  const isEmpty = docType == null;
  const label = isEmpty
    ? DOCUMENT_WIZARD_TYPE_DOC_LABEL
    : docType === "textuel"
      ? DOCUMENT_MODULE_TYPE_TEXT
      : DOCUMENT_MODULE_TYPE_IMAGE;
  const icon = docType === "iconographique" ? "image_inset" : ICONES_METIER.documents;
  return <Chip icon={icon} label={label} isEmpty={isEmpty} isFocused={focused} />;
}

function StructureChip({
  structure,
  elementCount,
}: {
  structure: AutonomousDocumentFormValues["structure"];
  elementCount: number;
}) {
  const focused = useIsFieldActive("structure");
  const isEmpty = structure == null;
  const label = isEmpty
    ? "Structure du document"
    : structure === "perspectives"
      ? DOC_STRUCTURE_PERSPECTIVES_TITLE
      : structure === "deux_temps"
        ? DOC_STRUCTURE_DEUX_TEMPS_TITLE
        : DOC_STRUCTURE_SIMPLE_TITLE;
  const icon = iconForDocumentStructure(structure, elementCount);
  return <Chip icon={icon} label={label} isEmpty={isEmpty} isFocused={focused} />;
}

function PeriodeChip({ label }: { label: string }) {
  const focused = useIsFieldActive("connaissances");
  const isEmpty = !label;
  return (
    <span
      className={cn(
        "doc-sommaire-badge inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep",
        isEmpty && "is-empty",
        focused && "is-focused",
      )}
    >
      <PeriodeIcon />
      <span className="ml-1">{label || "Période historique"}</span>
    </span>
  );
}

function Chip({
  icon,
  label,
  isEmpty,
  isFocused,
}: {
  icon: string;
  label: string;
  isEmpty: boolean;
  isFocused: boolean;
}) {
  return (
    <span
      className={cn(
        "doc-sommaire-badge inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep",
        isEmpty && "is-empty",
        isFocused && "is-focused",
      )}
    >
      <span
        className="doc-sommaire-badge-icon material-symbols-outlined text-[0.9em] text-accent"
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </span>
  );
}

function MetaBadge({
  fieldKey,
  icon,
  value,
  placeholder,
}: {
  fieldKey: string;
  icon: string;
  value: string;
  placeholder: string;
}) {
  const focused = useIsFieldActive(fieldKey);
  const isEmpty = !value;
  return <Chip icon={icon} label={value || placeholder} isEmpty={isEmpty} isFocused={focused} />;
}

function AspectsBadge({ aspects }: { aspects: string[] }) {
  const focused = useIsFieldActive("aspects_societe");
  const isEmpty = aspects.length === 0;
  return (
    <span
      className={cn(
        "doc-sommaire-badge inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep",
        isEmpty && "is-empty",
        focused && "is-focused",
      )}
    >
      <span
        className="doc-sommaire-badge-icon material-symbols-outlined text-[0.9em] text-accent"
        aria-hidden="true"
      >
        deployed_code
      </span>
      {isEmpty
        ? DOCUMENT_MODULE_ASPECTS_LABEL
        : aspects.map((aspect, i) => (
            <span key={aspect} className="flex items-center gap-1">
              {i > 0 ? <span className="text-muted">·</span> : null}
              <span>{aspect}</span>
            </span>
          ))}
    </span>
  );
}

function SourceTypeBadge({ value }: { value: "primaire" | "secondaire" | null }) {
  const focused = useIsFieldActive("source_type");
  const isEmpty = value == null;
  return (
    <span
      className={cn(
        "doc-sommaire-badge inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs text-deep",
        isEmpty && "is-empty",
        focused && "is-focused",
      )}
    >
      {isEmpty ? (
        <span>{DOCUMENT_MODULE_SOURCE_TYPE_LABEL}</span>
      ) : (
        <>
          <span className="font-bold">Source</span>
          <span className="font-normal">{value === "primaire" ? "Primaire" : "Secondaire"}</span>
        </>
      )}
    </span>
  );
}

function CategorieBadge({
  docType,
  info,
}: {
  docType: "textuel" | "iconographique" | null;
  info: { icon: string; label: string } | null;
}) {
  const focused = useIsFieldActive("categorie");
  const isEmpty = info == null;
  const placeholder =
    docType === "textuel"
      ? "Catégorie textuelle"
      : docType === "iconographique"
        ? "Catégorie iconographique"
        : "Catégorie";
  const icon = info?.icon ?? "label";
  const label = info?.label ?? placeholder;
  return <Chip icon={icon} label={label} isEmpty={isEmpty} isFocused={focused} />;
}

function AuteurBadge({ name }: { name: string }) {
  const isEmpty = !name;
  return (
    <span
      className={cn(
        "doc-sommaire-badge inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep",
        isEmpty && "is-empty",
      )}
    >
      <span
        className="doc-sommaire-badge-icon material-symbols-outlined text-[0.9em] text-accent"
        aria-hidden="true"
      >
        person
      </span>
      {name || "Auteur"}
    </span>
  );
}

function DateCreationBadge() {
  const label = formatDateCreationFr(new Date());
  return (
    <span className="doc-sommaire-badge inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
      <span
        className="doc-sommaire-badge-icon material-symbols-outlined text-[0.9em] text-accent"
        aria-hidden="true"
      >
        calendar_today
      </span>
      {label}
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
  docType,
  hasContenu,
  rendererFirstEl,
  imageUrl,
}: {
  docType: "textuel" | "iconographique" | null;
  hasContenu: boolean;
  rendererFirstEl: DocumentElement | undefined;
  imageUrl: string;
}) {
  if (hasContenu && rendererFirstEl) {
    return <DocumentElementRenderer element={rendererFirstEl} hideSource />;
  }

  if (docType === "iconographique") {
    if (imageUrl) {
      return <SkeletonRect />;
    }
    return <SkeletonRect />;
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <SkeletonLine width="95%" />
      <SkeletonLine width="88%" />
      <SkeletonLine width="92%" />
      <SkeletonLine width="80%" />
      <SkeletonLine width="45%" />
    </div>
  );
}

function DocSourceFooter({ hasSource, sourceHtml }: { hasSource: boolean; sourceHtml: string }) {
  return (
    <div className="mt-3 border-t border-dashed border-border pt-2 text-[11px] italic text-steel">
      <span className="not-italic font-bold uppercase tracking-wider text-muted">Source</span>
      {" · "}
      {hasSource ? (
        <span
          className="inline [&>p]:m-0 [&>p]:inline"
          dangerouslySetInnerHTML={{ __html: sourceCitationDisplayHtml(sourceHtml) }}
        />
      ) : (
        <span className="inline-flex min-w-[40%] align-middle">
          <SkeletonLine width="100%" />
        </span>
      )}
    </div>
  );
}

function ConnaissancesTree({
  items,
  hasConnaissances,
}: {
  items: AutonomousDocumentFormValues["connaissances_miller"];
  hasConnaissances: boolean;
}) {
  if (!hasConnaissances) {
    return (
      <div className="flex flex-col gap-2 py-1">
        <SkeletonLine width="80%" />
        <SkeletonLine width="60%" />
      </div>
    );
  }
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

function aspectsList(aspects: AutonomousDocumentFormValues["aspects"]): string[] {
  const out: string[] = [];
  if (aspects.economique) out.push("Économique");
  if (aspects.politique) out.push("Politique");
  if (aspects.social) out.push("Social");
  if (aspects.culturel) out.push("Culturel");
  if (aspects.territorial) out.push("Territorial");
  return out;
}

function getCategorieInfoFromForm(
  el: AutonomousDocumentFormValues["elements"][number] | undefined,
): { icon: string; label: string } | null {
  if (!el || !el.type) return null;
  if (el.type === "textuel") {
    if (!el.categorie_textuelle) return null;
    const found = getDocumentCategorieTextuelle(el.categorie_textuelle);
    return found ? { icon: found.icon, label: found.label } : null;
  }
  if (!el.type_iconographique) return null;
  const found = getDocumentCategorieIconographique(el.type_iconographique);
  return found ? { icon: found.icon, label: found.label } : null;
}

function buildRendererDocument(values: AutonomousDocumentFormValues): RendererDocument | null {
  const elements = values.elements
    .map((el) => toRendererElement(el))
    .filter((el): el is DocumentElement => el != null);
  if (elements.length === 0) return null;
  return {
    id: "preview",
    titre: values.titre || "",
    structure: values.structure ?? "simple",
    elements,
    repereTemporelDocument: values.repere_temporel,
  };
}

function toRendererElement(
  el: AutonomousDocumentFormValues["elements"][number],
): DocumentElement | null {
  if (el.type == null) return null;
  const base = {
    id: el.id,
    source: el.source_citation,
    sourceType: el.source_type ?? "secondaire",
    auteur: el.auteur,
    repereTemporel: el.repere_temporel,
    sousTitre: el.sous_titre,
  };
  if (el.type === "textuel") {
    return {
      ...base,
      type: "textuel",
      contenu: el.contenu ?? "",
      categorieTextuelle: (el.categorie_textuelle ??
        "documents_officiels") as CategorieTextuelleValue,
    } satisfies TextuelElement;
  }
  return {
    ...base,
    type: "iconographique",
    imageUrl: el.image_url ?? "",
    legende: el.image_legende,
    legendePosition: el.image_legende_position ?? undefined,
    categorieIconographique: (el.type_iconographique ??
      "carte") as DocumentCategorieIconographiqueId,
  } satisfies IconographiqueElement;
}

function formatDateCreationFr(d: Date): string {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `Créé le ${formatter.format(d)}`;
}
