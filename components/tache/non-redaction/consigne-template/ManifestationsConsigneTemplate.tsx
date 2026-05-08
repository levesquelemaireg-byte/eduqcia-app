"use client";

import { useId } from "react";
import { ConsigneTemplateCard } from "@/components/tache/non-redaction/consigne-template/ConsigneTemplateCard";
import { LimitCounterPill } from "@/components/ui/LimitCounterPill";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  MANIFESTATIONS_LIMITS,
  type ManifestationsComportementId,
} from "@/lib/tache/non-redaction/manifestations-payload";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import {
  NR_CARTE_TEMPLATE_LEGEND_AUTO,
  NR_CARTE_TEMPLATE_LEGEND_EDITABLE,
  NR_CARTE_TEMPLATE_LEGEND_FIXED,
  NR_CARTE_TEMPLATE_RENUMBER_NOTE,
  NR_CARTE_WIZARD_DOC_TOKEN_TITLE,
  NR_MANIFESTATIONS_51_INSCRIVEZ,
  NR_MANIFESTATIONS_52_INSCRIVEZ,
  NR_MANIFESTATIONS_PUBLISHED_INTRO_PREFIX,
  NR_MANIFESTATIONS_PUBLISHED_INTRO_SUFFIX,
  NR_MANIFESTATIONS_SUJET_ARIA,
  NR_MANIFESTATIONS_SUJET_PLACEHOLDER_51,
  NR_MANIFESTATIONS_SUJET_PLACEHOLDER_52,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export type ManifestationsConsigneTemplateProps = {
  comportementId: ManifestationsComportementId;
  consigneSujet: string;
  onConsigneSujetChange: (next: string) => void;
  describedByIds: string;
  inputId: string;
};

export function ManifestationsConsigneTemplate(props: ManifestationsConsigneTemplateProps) {
  const legendId = useId();
  const fullDescribedBy = `${props.describedByIds} ${legendId}`.trim();
  const limit = MANIFESTATIONS_LIMITS.consigneSujet[props.comportementId];

  const placeholder =
    props.comportementId === "5.1"
      ? NR_MANIFESTATIONS_SUJET_PLACEHOLDER_51
      : NR_MANIFESTATIONS_SUJET_PLACEHOLDER_52;
  const inscrivez =
    props.comportementId === "5.1"
      ? NR_MANIFESTATIONS_51_INSCRIVEZ
      : NR_MANIFESTATIONS_52_INSCRIVEZ;
  const docTokenLabel =
    props.comportementId === "5.1" ? "{{doc_1}} et {{doc_2}}" : "{{doc_1}} à {{doc_4}}";

  const body = (
    <div className="space-y-3 text-base font-semibold leading-relaxed text-deep sm:text-lg">
      <p className="m-0">
        <span>{NR_MANIFESTATIONS_PUBLISHED_INTRO_PREFIX}</span>
        <DocToken label={docTokenLabel} />
        <span> {NR_MANIFESTATIONS_PUBLISHED_INTRO_SUFFIX} </span>
        <EditableInput
          id={props.inputId}
          value={props.consigneSujet}
          onChange={props.onConsigneSujetChange}
          placeholder={placeholder}
          ariaLabel={NR_MANIFESTATIONS_SUJET_ARIA}
          describedByIds={fullDescribedBy}
          max={limit.max}
        />
        <span>.</span>
      </p>
      <p className="m-0 font-normal italic text-muted">{inscrivez}</p>
    </div>
  );

  return (
    <div className="space-y-2">
      <ConsigneTemplateCard
        body={body}
        footer="Seule la zone soulignée en bleu est modifiable. Les numéros de documents sont générés automatiquement."
        legend={
          <>
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm border border-border bg-transparent"
                aria-hidden
              />
              <span>{NR_CARTE_TEMPLATE_LEGEND_FIXED}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-8 shrink-0 rounded-sm bg-border/70" aria-hidden />
              <span>{NR_CARTE_TEMPLATE_LEGEND_AUTO}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-8 shrink-0 border-b-2 border-accent" aria-hidden />
              <span id={legendId}>{NR_CARTE_TEMPLATE_LEGEND_EDITABLE}</span>
            </span>
          </>
        }
        infoNote={<p className="m-0">{NR_CARTE_TEMPLATE_RENUMBER_NOTE}</p>}
      />
      <div className="flex justify-end">
        <LimitCounterPill
          current={props.consigneSujet.length}
          max={limit.max}
          warningAfter={limit.warn}
          unit="characters"
          showDangerAtMax={false}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sous-blocs partagés                                                        */
/* -------------------------------------------------------------------------- */

function DocToken({ label }: { label: string }) {
  return (
    <span
      className="mx-1 inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-panel-alt px-2 py-0.5 align-middle text-sm font-medium text-deep select-none"
      role="img"
      aria-label={`${label}. ${NR_CARTE_WIZARD_DOC_TOKEN_TITLE}`}
    >
      <span aria-hidden>{label}</span>
      <span
        className="material-symbols-outlined text-[1em] text-muted"
        aria-hidden
        title={
          materialIconTooltip(ICONES_METIER.valeurAutoGeneree) ?? NR_CARTE_WIZARD_DOC_TOKEN_TITLE
        }
      >
        settings
      </span>
    </span>
  );
}

const editableInputClassName = cn(
  "mx-0.5 inline-block min-w-[10rem] max-w-[min(100%,28rem)] border-0 border-b-2 border-accent bg-transparent px-0.5 py-0.5 align-baseline text-accent italic placeholder:italic placeholder:text-muted focus:bg-accent/10 focus:outline-none focus:ring-0 sm:min-w-[12rem]",
);

function EditableInput({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
  describedByIds,
  max,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  describedByIds: string;
  max: number;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      maxLength={max}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-describedby={describedByIds}
      className={editableInputClassName}
    />
  );
}

// On réutilise le badge ministériel partagé déjà exporté par le template carte-historique.
export { CarteHistoriqueConsigneMinisterialBadge as ManifestationsConsigneMinisterialBadge } from "@/components/tache/non-redaction/consigne-template/CarteHistoriqueConsigneTemplate";
