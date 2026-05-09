"use client";

import { useId } from "react";
import { ConsigneTemplateCard } from "@/components/tache/non-redaction/consigne-template/ConsigneTemplateCard";
import { LimitCounterPill } from "@/components/ui/LimitCounterPill";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  CAUSES_CONSEQUENCES_LIMITS,
  type CausesConsequencesComportementId,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import {
  NR_CARTE_TEMPLATE_LEGEND_AUTO,
  NR_CARTE_TEMPLATE_LEGEND_EDITABLE,
  NR_CARTE_TEMPLATE_LEGEND_FIXED,
  NR_CARTE_TEMPLATE_RENUMBER_NOTE,
  NR_CARTE_WIZARD_DOC_TOKEN_TITLE,
  NR_CAUSES_CONSEQUENCES_43_CONSIGNE_PREFIX,
  NR_CAUSES_CONSEQUENCES_43_CONSIGNE_SUFFIX,
  NR_CAUSES_CONSEQUENCES_44_BULLET_CAUSE_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_BULLET_CONSEQUENCE_PREFIX,
  NR_CAUSES_CONSEQUENCES_44_CONSIGNE_INTRO,
  NR_CAUSES_CONSEQUENCES_SUJET_ARIA,
  NR_CAUSES_CONSEQUENCES_SUJET_PLACEHOLDER_43,
  NR_CAUSES_CONSEQUENCES_SUJET_PLACEHOLDER_44,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export type CausesConsequencesConsigneTemplateProps = {
  comportementId: CausesConsequencesComportementId;
  consigneSujet: string;
  onConsigneSujetChange: (next: string) => void;
  describedByIds: string;
  inputId: string;
};

/**
 * Template consigne ministérielle pour OI4 — 4.3 et 4.4.
 *
 * - 4.3 (deux facteurs explicatifs) : intro mono-paragraphe avec un sujet
 *   éditable, suivie d'un point final.
 * - 4.4 (cause et conséquence) : intro suivie d'une liste à puces avec deux
 *   sujets éditables (cause / conséquence) — le même sujet est reproduit dans
 *   les deux puces, et l'enseignant le saisit une seule fois (synchronisé).
 *
 * Une seule zone éditable par comportement, propagée dans toutes les
 * occurrences du sujet.
 */
export function CausesConsequencesConsigneTemplate(props: CausesConsequencesConsigneTemplateProps) {
  const legendId = useId();
  const fullDescribedBy = `${props.describedByIds} ${legendId}`.trim();
  const limit = CAUSES_CONSEQUENCES_LIMITS.consigneSujet;

  const placeholder =
    props.comportementId === "4.3"
      ? NR_CAUSES_CONSEQUENCES_SUJET_PLACEHOLDER_43
      : NR_CAUSES_CONSEQUENCES_SUJET_PLACEHOLDER_44;

  const body =
    props.comportementId === "4.3" ? (
      <div className="space-y-3 text-base font-semibold leading-relaxed text-deep sm:text-lg">
        <p className="m-0">
          <span>{NR_CAUSES_CONSEQUENCES_43_CONSIGNE_PREFIX}</span>
          <EditableInput
            id={props.inputId}
            value={props.consigneSujet}
            onChange={props.onConsigneSujetChange}
            placeholder={placeholder}
            ariaLabel={NR_CAUSES_CONSEQUENCES_SUJET_ARIA}
            describedByIds={fullDescribedBy}
            max={limit.max}
          />
          <span>{NR_CAUSES_CONSEQUENCES_43_CONSIGNE_SUFFIX}</span>
        </p>
      </div>
    ) : (
      <div className="space-y-3 text-base font-semibold leading-relaxed text-deep sm:text-lg">
        <p className="m-0">{NR_CAUSES_CONSEQUENCES_44_CONSIGNE_INTRO}</p>
        <ul className="m-0 list-disc space-y-2 pl-6">
          <li>
            <span>{NR_CAUSES_CONSEQUENCES_44_BULLET_CAUSE_PREFIX}</span>
            <EditableInput
              id={props.inputId}
              value={props.consigneSujet}
              onChange={props.onConsigneSujetChange}
              placeholder={placeholder}
              ariaLabel={NR_CAUSES_CONSEQUENCES_SUJET_ARIA}
              describedByIds={fullDescribedBy}
              max={limit.max}
            />
            <span> ;</span>
          </li>
          <li>
            <span>{NR_CAUSES_CONSEQUENCES_44_BULLET_CONSEQUENCE_PREFIX}</span>
            <EditableMirror value={props.consigneSujet} placeholder={placeholder} />
            <span>.</span>
          </li>
        </ul>
      </div>
    );

  return (
    <div className="space-y-2">
      <ConsigneTemplateCard
        body={body}
        footer="Seule la zone soulignée en bleu est modifiable. Le sujet saisi est repris dans les deux puces (4.4) et dans les libellés des cases (4.3 et 4.4)."
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
/*  EditableInput + EditableMirror                                             */
/* -------------------------------------------------------------------------- */

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

/**
 * Reflet en lecture seule du sujet — utilisé pour la deuxième puce de 4.4.
 * Visuellement identique à un EditableInput (souligné accent, italique) mais
 * non éditable. Si vide, affiche le placeholder en muted comme l'input.
 */
function EditableMirror({ value, placeholder }: { value: string; placeholder: string }) {
  const isEmpty = value.length === 0;
  const display = isEmpty ? placeholder : value;
  return (
    <span
      role="presentation"
      aria-hidden
      title={NR_CARTE_WIZARD_DOC_TOKEN_TITLE}
      data-tooltip={
        materialIconTooltip(ICONES_METIER.valeurAutoGeneree) ?? NR_CARTE_WIZARD_DOC_TOKEN_TITLE
      }
      className={cn(
        "mx-0.5 inline-block min-w-[10rem] max-w-[min(100%,28rem)] border-0 border-b-2 border-accent/60 bg-transparent px-0.5 py-0.5 align-baseline italic sm:min-w-[12rem]",
        isEmpty ? "text-muted" : "text-accent",
      )}
    >
      {display}
    </span>
  );
}
