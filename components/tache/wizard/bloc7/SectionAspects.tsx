"use client";

import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import { ARIA_OPEN_FIELD_HELP, BLOC7_ASPECTS_HELP, BLOC7_ASPECTS_LABEL } from "@/lib/ui/ui-copy";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";

const ASPECT_ORDER: AspectSocieteKey[] = [
  "economique",
  "politique",
  "social",
  "culturel",
  "territorial",
];

type Props = {
  aspects: Record<AspectSocieteKey, boolean>;
  onToggle: (key: AspectSocieteKey) => void;
  onInfoClick: () => void;
};

export function SectionAspects({ aspects, onToggle, onInfoClick }: Props) {
  return (
    <section className="space-y-2 border-t border-border pt-5">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-accent text-[1em]"
            aria-hidden="true"
            title={materialIconTooltip(BLOC3_SECTION_ICON.aspects)}
          >
            {BLOC3_SECTION_ICON.aspects}
          </span>
          {BLOC7_ASPECTS_LABEL} <RequiredMark />
        </label>
        <button
          type="button"
          onClick={onInfoClick}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent hover:bg-panel-alt"
          aria-label={ARIA_OPEN_FIELD_HELP}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            info
          </span>
        </button>
      </div>
      <p className="text-xs text-muted">{BLOC7_ASPECTS_HELP}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ASPECT_ORDER.map((key) => {
          const isSelected = aspects[key];
          return (
            <button
              key={key}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggle(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-panel text-steel hover:border-accent/50"
              }`}
            >
              {isSelected ? (
                <span className="material-symbols-outlined mr-1 text-[0.9em]" aria-hidden="true">
                  check
                </span>
              ) : null}
              {ASPECT_LABEL[key]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
