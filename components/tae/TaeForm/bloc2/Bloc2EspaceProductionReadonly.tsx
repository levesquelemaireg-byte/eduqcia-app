"use client";

import { cn } from "@/lib/utils/cn";
import type { ComportementAttenduJson } from "@/lib/types/oi";
import { nbLignesFromComportementJson } from "@/lib/tae/blueprint-helpers";
import {
  BLOC2_ESPACE_PRODUCTION_COPY_NON_REDACTION,
  BLOC2_ESPACE_PRODUCTION_REDACTION_AFTER,
  BLOC2_ESPACE_PRODUCTION_REDACTION_BEFORE,
  BLOC2_ESPACE_PRODUCTION_SECTION_LABEL,
} from "@/lib/ui/ui-copy";
import { BLOC2_STEPPER_ICON } from "@/components/tae/TaeForm/bloc2-stepper-icons";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";

type Props = {
  selectedComportement: ComportementAttenduJson | undefined;
};

export function Bloc2EspaceProductionReadonly({ selectedComportement }: Props) {
  if (!selectedComportement) return null;

  const nb = nbLignesFromComportementJson(selectedComportement);
  const isRedactionnel = nb > 0;

  return (
    <div className="space-y-2">
      <div className="icon-text text-sm font-semibold text-deep">
        <span
          className="material-symbols-outlined text-accent"
          aria-hidden="true"
          title={materialIconTooltip(BLOC2_STEPPER_ICON.nbLignes)}
        >
          {BLOC2_STEPPER_ICON.nbLignes}
        </span>
        <span>{BLOC2_ESPACE_PRODUCTION_SECTION_LABEL}</span>
      </div>
      <div
        className={cn(
          "flex items-start gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-secondary)] bg-panel-alt px-3.5 py-3 text-sm text-steel",
        )}
      >
        <span
          className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-muted"
          aria-hidden="true"
          title={materialIconTooltip("settings")}
        >
          settings
        </span>
        {isRedactionnel ? (
          <p className="min-w-0 leading-relaxed">
            {BLOC2_ESPACE_PRODUCTION_REDACTION_BEFORE}
            <strong className="font-semibold text-deep">{nb}</strong>
            {BLOC2_ESPACE_PRODUCTION_REDACTION_AFTER}
          </p>
        ) : (
          <p className="min-w-0 leading-relaxed">{BLOC2_ESPACE_PRODUCTION_COPY_NON_REDACTION}</p>
        )}
      </div>
    </div>
  );
}
