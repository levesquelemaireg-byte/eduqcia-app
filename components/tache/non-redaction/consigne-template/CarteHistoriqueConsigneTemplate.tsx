"use client";

import { useId } from "react";
import { ConsigneTemplateCard } from "@/components/tache/non-redaction/consigne-template/ConsigneTemplateCard";
import { LimitCounterPill } from "@/components/ui/LimitCounterPill";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  CARTE_ELEMENT_LIMITS,
  type CarteHistoriqueComportementId,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import {
  NR_CARTE_21_QUESTION_PREFIX,
  NR_CARTE_21_QUESTION_SUFFIX,
  NR_CARTE_22_QUESTION,
  NR_CARTE_23_ITEM_PREFIX,
  NR_CARTE_23_ITEM_SUFFIX,
  NR_CARTE_23_QUESTION_LEAD,
  NR_CARTE_CONSIGNE_MINISTERIAL_BADGE,
  NR_CARTE_ELEMENT_ARIA_21,
  NR_CARTE_ELEMENT_ARIA_22_1,
  NR_CARTE_ELEMENT_ARIA_22_2,
  NR_CARTE_ELEMENT_ARIA_23_1,
  NR_CARTE_ELEMENT_ARIA_23_2,
  NR_CARTE_ELEMENT_PLACEHOLDER_21,
  NR_CARTE_ELEMENT_PLACEHOLDER_22_1,
  NR_CARTE_ELEMENT_PLACEHOLDER_22_2,
  NR_CARTE_ELEMENT_PLACEHOLDER_23_1,
  NR_CARTE_ELEMENT_PLACEHOLDER_23_2,
  NR_CARTE_PUBLISHED_INTRO_PREFIX,
  NR_CARTE_PUBLISHED_INTRO_SUFFIX,
  NR_CARTE_TEMPLATE_CARD_FOOTER,
  NR_CARTE_TEMPLATE_LEGEND_AUTO,
  NR_CARTE_TEMPLATE_LEGEND_EDITABLE,
  NR_CARTE_TEMPLATE_LEGEND_FIXED,
  NR_CARTE_TEMPLATE_RENUMBER_NOTE,
  NR_CARTE_WIZARD_DOC_TOKEN_LABEL,
  NR_CARTE_WIZARD_DOC_TOKEN_TITLE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Composant principal                                                        */
/* -------------------------------------------------------------------------- */

export type CarteHistoriqueConsigneTemplateProps = {
  comportementId: CarteHistoriqueComportementId;
  element1: string;
  element2: string;
  onElement1Change: (next: string) => void;
  onElement2Change: (next: string) => void;
  describedByIds: string;
  element1InputId: string;
  element2InputId: string;
};

export function CarteHistoriqueConsigneTemplate(props: CarteHistoriqueConsigneTemplateProps) {
  const legendId = useId();
  const fullDescribedBy = `${props.describedByIds} ${legendId}`.trim();
  const limit = CARTE_ELEMENT_LIMITS[props.comportementId];

  const body =
    props.comportementId === "2.1" ? (
      <Body21
        value={props.element1}
        onChange={props.onElement1Change}
        inputId={props.element1InputId}
        describedByIds={fullDescribedBy}
        max={limit.max}
      />
    ) : props.comportementId === "2.2" ? (
      <Body22
        element1={props.element1}
        element2={props.element2}
        onElement1Change={props.onElement1Change}
        onElement2Change={props.onElement2Change}
        element1InputId={props.element1InputId}
        element2InputId={props.element2InputId}
        describedByIds={fullDescribedBy}
        max={limit.max}
      />
    ) : (
      <Body23
        element1={props.element1}
        element2={props.element2}
        onElement1Change={props.onElement1Change}
        onElement2Change={props.onElement2Change}
        element1InputId={props.element1InputId}
        element2InputId={props.element2InputId}
        describedByIds={fullDescribedBy}
        max={limit.max}
      />
    );

  const charactersUsed =
    props.comportementId === "2.1"
      ? props.element1.length
      : props.element1.length + props.element2.length;
  const aggregatedMax = props.comportementId === "2.1" ? limit.max : limit.max * 2;
  const aggregatedWarn = props.comportementId === "2.1" ? limit.warn : limit.warn * 2;

  return (
    <div className="space-y-2">
      <ConsigneTemplateCard
        body={body}
        footer={NR_CARTE_TEMPLATE_CARD_FOOTER}
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
          current={charactersUsed}
          max={aggregatedMax}
          warningAfter={aggregatedWarn}
          unit="characters"
          showDangerAtMax={false}
        />
      </div>
    </div>
  );
}

export function CarteHistoriqueConsigneMinisterialBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-deep">
      <span className="material-symbols-outlined text-[1em] text-accent" aria-hidden>
        lock
      </span>
      {NR_CARTE_CONSIGNE_MINISTERIAL_BADGE}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sous-blocs partagés                                                        */
/* -------------------------------------------------------------------------- */

function DocToken() {
  return (
    <span
      className="mx-1 inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-panel-alt px-2 py-0.5 align-middle text-sm font-medium text-deep select-none"
      role="img"
      aria-label={`${NR_CARTE_WIZARD_DOC_TOKEN_LABEL}. ${NR_CARTE_WIZARD_DOC_TOKEN_TITLE}`}
    >
      <span aria-hidden>{NR_CARTE_WIZARD_DOC_TOKEN_LABEL}</span>
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

/* -------------------------------------------------------------------------- */
/*  2.1 — « Quelle lettre … correspond à <input> ? »                          */
/* -------------------------------------------------------------------------- */

function Body21({
  value,
  onChange,
  inputId,
  describedByIds,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  inputId: string;
  describedByIds: string;
  max: number;
}) {
  return (
    <div className="text-base font-semibold leading-relaxed text-deep sm:text-lg">
      <span>{NR_CARTE_PUBLISHED_INTRO_PREFIX}</span>
      <DocToken />
      <span>
        {NR_CARTE_PUBLISHED_INTRO_SUFFIX} {NR_CARTE_21_QUESTION_PREFIX}
      </span>
      <EditableInput
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={NR_CARTE_ELEMENT_PLACEHOLDER_21}
        ariaLabel={NR_CARTE_ELEMENT_ARIA_21}
        describedByIds={describedByIds}
        max={max}
      />
      <span>{NR_CARTE_21_QUESTION_SUFFIX}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  2.2 — « … emplacement de ces éléments ? <input> et <input> »              */
/* -------------------------------------------------------------------------- */

function Body22({
  element1,
  element2,
  onElement1Change,
  onElement2Change,
  element1InputId,
  element2InputId,
  describedByIds,
  max,
}: {
  element1: string;
  element2: string;
  onElement1Change: (v: string) => void;
  onElement2Change: (v: string) => void;
  element1InputId: string;
  element2InputId: string;
  describedByIds: string;
  max: number;
}) {
  return (
    <div className="space-y-3 text-base font-semibold leading-relaxed text-deep sm:text-lg">
      <p className="m-0">
        <span>{NR_CARTE_PUBLISHED_INTRO_PREFIX}</span>
        <DocToken />
        <span>
          {NR_CARTE_PUBLISHED_INTRO_SUFFIX} {NR_CARTE_22_QUESTION}
        </span>
      </p>
      <p className="m-0">
        <EditableInput
          id={element1InputId}
          value={element1}
          onChange={onElement1Change}
          placeholder={NR_CARTE_ELEMENT_PLACEHOLDER_22_1}
          ariaLabel={NR_CARTE_ELEMENT_ARIA_22_1}
          describedByIds={describedByIds}
          max={max}
        />
        <span> et </span>
        <EditableInput
          id={element2InputId}
          value={element2}
          onChange={onElement2Change}
          placeholder={NR_CARTE_ELEMENT_PLACEHOLDER_22_2}
          ariaLabel={NR_CARTE_ELEMENT_ARIA_22_2}
          describedByIds={describedByIds}
          max={max}
        />
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  2.3 — « Quelle lettre … correspond : • à <input> ? • à <input> ? »        */
/* -------------------------------------------------------------------------- */

function Body23({
  element1,
  element2,
  onElement1Change,
  onElement2Change,
  element1InputId,
  element2InputId,
  describedByIds,
  max,
}: {
  element1: string;
  element2: string;
  onElement1Change: (v: string) => void;
  onElement2Change: (v: string) => void;
  element1InputId: string;
  element2InputId: string;
  describedByIds: string;
  max: number;
}) {
  return (
    <div className="space-y-3 text-base font-semibold leading-relaxed text-deep sm:text-lg">
      <p className="m-0">
        <span>{NR_CARTE_PUBLISHED_INTRO_PREFIX}</span>
        <DocToken />
        <span>
          {NR_CARTE_PUBLISHED_INTRO_SUFFIX} {NR_CARTE_23_QUESTION_LEAD}
        </span>
      </p>
      <ul className="m-0 space-y-2 pl-5">
        <li className="list-disc">
          <span>{NR_CARTE_23_ITEM_PREFIX}</span>
          <EditableInput
            id={element1InputId}
            value={element1}
            onChange={onElement1Change}
            placeholder={NR_CARTE_ELEMENT_PLACEHOLDER_23_1}
            ariaLabel={NR_CARTE_ELEMENT_ARIA_23_1}
            describedByIds={describedByIds}
            max={max}
          />
          <span>{NR_CARTE_23_ITEM_SUFFIX}</span>
        </li>
        <li className="list-disc">
          <span>{NR_CARTE_23_ITEM_PREFIX}</span>
          <EditableInput
            id={element2InputId}
            value={element2}
            onChange={onElement2Change}
            placeholder={NR_CARTE_ELEMENT_PLACEHOLDER_23_2}
            ariaLabel={NR_CARTE_ELEMENT_ARIA_23_2}
            describedByIds={describedByIds}
            max={max}
          />
          <span>{NR_CARTE_23_ITEM_SUFFIX}</span>
        </li>
      </ul>
    </div>
  );
}
