"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { LEGEND_POSITION_GRID } from "@/components/documents/document-legend-ui";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
import type { DocumentLegendPosition } from "@/lib/tae/document-helpers";
import {
  DOCUMENT_MODULE_LEGEND_POSITION_ERROR,
  DOCUMENT_MODULE_LEGEND_POSITION_HELP_MODAL_BODY,
  DOCUMENT_MODULE_LEGEND_POSITION_SUBTITLE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  value: DocumentLegendPosition | null;
  onChange: (next: DocumentLegendPosition) => void;
  showPositionError?: boolean;
};

/** Rangée de 4 boutons radio iconiques — coins légende ; aide (i) → `SimpleModal` ; glyphes `docs/DECISIONS.md`. */
export function DocumentLegendPositionGrid({ value, onChange, showPositionError }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const headingId = useId();
  const groupId = useId();

  const selectedIndex = LEGEND_POSITION_GRID.findIndex((p) => p.value === value);
  const n = LEGEND_POSITION_GRID.length;

  const tabIndexFor = (index: number): number => {
    if (value == null) return index === 0 ? 0 : -1;
    return index === selectedIndex ? 0 : -1;
  };

  const moveFocus = (fromIndex: number, delta: number) => {
    const next = (fromIndex + delta + n) % n;
    const el = document.getElementById(`${groupId}-${LEGEND_POSITION_GRID[next]!.value}`);
    el?.focus();
    onChange(LEGEND_POSITION_GRID[next]!.value);
  };

  const onRadioKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(index, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      moveFocus(index, -index);
    } else if (e.key === "End") {
      e.preventDefault();
      moveFocus(index, n - 1 - index);
    }
  };

  return (
    <>
      <SimpleModal
        open={helpOpen}
        title={DOCUMENT_MODULE_LEGEND_POSITION_SUBTITLE}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {DOCUMENT_MODULE_LEGEND_POSITION_HELP_MODAL_BODY}
        </p>
      </SimpleModal>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <p id={headingId} className="m-0 text-sm font-semibold text-deep">
            {DOCUMENT_MODULE_LEGEND_POSITION_SUBTITLE}
          </p>
          <FieldHelpModalButton onClick={() => setHelpOpen(true)} />
        </div>
        <div
          id={groupId}
          role="radiogroup"
          aria-labelledby={headingId}
          className="flex flex-row flex-nowrap gap-2 overflow-x-auto"
        >
          {LEGEND_POSITION_GRID.map((p, index) => {
            const selected = value === p.value;
            return (
              <button
                key={p.value}
                id={`${groupId}-${p.value}`}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={p.aria}
                tabIndex={tabIndexFor(index)}
                onClick={() => onChange(p.value)}
                onKeyDown={(e) => onRadioKeyDown(e, index)}
                className={cn(
                  "box-border flex h-[44px] w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-md transition-all duration-150",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  selected
                    ? "border-[1.5px] border-solid border-[color:var(--color-border-info)] bg-[color:var(--color-background-info)]"
                    : "border-[0.5px] border-solid border-[color:var(--color-border-secondary)] bg-transparent hover:bg-[color:var(--color-background-secondary)]",
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[1.35em]",
                    selected ? "text-[color:var(--color-text-info)]" : "text-[color:var(--color-text-secondary)]",
                    p.mirror && "scale-x-[-1]",
                  )}
                  aria-hidden="true"
                >
                  {p.glyph}
                </span>
              </button>
            );
          })}
        </div>
        {showPositionError ? (
          <p className="text-xs font-medium text-error" role="alert">
            {DOCUMENT_MODULE_LEGEND_POSITION_ERROR}
          </p>
        ) : null}
      </div>
    </>
  );
}
