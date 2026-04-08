"use client";

import { useId } from "react";
import { LimitCounterPill } from "@/components/ui/LimitCounterPill";
import { ConsigneTemplateCard } from "@/components/tae/non-redaction/consigne-template/ConsigneTemplateCard";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import {
  formatOrdreWizardDocTokenLabel,
  ORDRE_CONSIGNE_THEME_MAX_LEN,
  ORDRE_CONSIGNE_THEME_WARN_LEN,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import {
  NR_ORDRE_CONSIGNE_MINISTERIAL_BADGE,
  NR_ORDRE_PUBLISHED_INTRO_LES_DOCUMENTS,
  NR_ORDRE_PUBLISHED_INTRO_PORTENT_SUR,
  NR_ORDRE_PUBLISHED_INTRO_SUFFIX,
  NR_ORDRE_TEMPLATE_CARD_FOOTER,
  NR_ORDRE_TEMPLATE_LEGEND_AUTO,
  NR_ORDRE_TEMPLATE_LEGEND_EDITABLE,
  NR_ORDRE_TEMPLATE_LEGEND_FIXED,
  NR_ORDRE_TEMPLATE_RENUMBER_NOTE,
  NR_ORDRE_THEME_INPUT_ARIA_LABEL,
  NR_ORDRE_THEME_PLACEHOLDER,
  NR_ORDRE_WIZARD_DOC_TOKEN_TITLE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export type OrdreChronologiqueConsigneTemplateProps = {
  docCount: number;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  /** Identifiants d’éléments descriptifs (texte d’aide sous le label du Bloc 3). */
  describedByIds: string;
  /** Rattache le libellé « Consigne » au champ (accessibilité). */
  themeInputId: string;
};

export function OrdreChronologiqueConsigneTemplate({
  docCount,
  value,
  onChange,
  error,
  describedByIds,
  themeInputId,
}: OrdreChronologiqueConsigneTemplateProps) {
  const legendId = useId();
  const fullDescribedBy = `${describedByIds} ${legendId}`.trim();
  const tokenLabel = formatOrdreWizardDocTokenLabel(docCount);

  return (
    <div className="space-y-2">
      <ConsigneTemplateCard
        body={
          <div className="text-base font-semibold leading-relaxed text-deep sm:text-lg">
            <span className="text-deep">{NR_ORDRE_PUBLISHED_INTRO_LES_DOCUMENTS}</span>
            <span
              className="mx-1 inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-panel-alt px-2 py-0.5 align-middle text-sm font-medium text-deep select-none"
              role="img"
              aria-label={`${tokenLabel}. ${NR_ORDRE_WIZARD_DOC_TOKEN_TITLE}`}
            >
              <span aria-hidden>{tokenLabel}</span>
              <span
                className="material-symbols-outlined text-[1em] text-muted"
                aria-hidden
                title={materialIconTooltip("settings") ?? NR_ORDRE_WIZARD_DOC_TOKEN_TITLE}
              >
                settings
              </span>
            </span>
            <span className="text-deep">{NR_ORDRE_PUBLISHED_INTRO_PORTENT_SUR}</span>
            <input
              id={themeInputId}
              type="text"
              value={value}
              maxLength={ORDRE_CONSIGNE_THEME_MAX_LEN}
              onChange={(e) => onChange(e.target.value)}
              placeholder={NR_ORDRE_THEME_PLACEHOLDER}
              aria-label={NR_ORDRE_THEME_INPUT_ARIA_LABEL}
              aria-invalid={Boolean(error)}
              aria-describedby={fullDescribedBy}
              className={cn(
                "mx-0.5 inline-block min-w-[10rem] max-w-[min(100%,28rem)] border-0 border-b-2 border-accent bg-transparent px-0.5 py-0.5 align-baseline text-accent italic placeholder:italic placeholder:text-muted focus:bg-accent/10 focus:outline-none focus:ring-0 sm:min-w-[12rem]",
                error ? "border-error" : null,
              )}
            />
            <span className="text-deep">{NR_ORDRE_PUBLISHED_INTRO_SUFFIX}</span>
          </div>
        }
        footer={NR_ORDRE_TEMPLATE_CARD_FOOTER}
        legend={
          <>
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm border border-border bg-transparent"
                aria-hidden
              />
              <span>{NR_ORDRE_TEMPLATE_LEGEND_FIXED}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-8 shrink-0 rounded-sm bg-border/70" aria-hidden />
              <span>{NR_ORDRE_TEMPLATE_LEGEND_AUTO}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-8 shrink-0 border-b-2 border-accent" aria-hidden />
              <span id={legendId}>{NR_ORDRE_TEMPLATE_LEGEND_EDITABLE}</span>
            </span>
          </>
        }
        infoNote={<p className="m-0">{NR_ORDRE_TEMPLATE_RENUMBER_NOTE}</p>}
      />
      <div className="flex justify-end">
        <LimitCounterPill
          current={value.length}
          max={ORDRE_CONSIGNE_THEME_MAX_LEN}
          warningAfter={ORDRE_CONSIGNE_THEME_WARN_LEN}
          unit="characters"
          showDangerAtMax={false}
        />
      </div>
    </div>
  );
}

export function OrdreChronologiqueConsigneMinisterialBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-deep">
      <span className="material-symbols-outlined text-[1em] text-accent" aria-hidden>
        lock
      </span>
      {NR_ORDRE_CONSIGNE_MINISTERIAL_BADGE}
    </span>
  );
}
