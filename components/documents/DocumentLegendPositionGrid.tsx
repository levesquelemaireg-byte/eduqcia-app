"use client";

import { useState } from "react";
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

/** Grille 4 coins — aide (i) → `SimpleModal` ; glyphes alignés `docs/DECISIONS.md`. */
export function DocumentLegendPositionGrid({ value, onChange, showPositionError }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);

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
          <p className="m-0 text-sm font-semibold text-deep">
            {DOCUMENT_MODULE_LEGEND_POSITION_SUBTITLE}
          </p>
          <FieldHelpModalButton onClick={() => setHelpOpen(true)} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
          {LEGEND_POSITION_GRID.map((p) => {
            const selected = value === p.value;
            return (
              <button
                key={p.value}
                type="button"
                aria-label={p.aria}
                onClick={() => onChange(p.value)}
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center rounded-lg border text-deep ring-1 transition-colors",
                  selected
                    ? "border-accent bg-accent/10 ring-accent/30"
                    : "border-border bg-panel ring-border/40 hover:border-accent/35",
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[1.5em]",
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
