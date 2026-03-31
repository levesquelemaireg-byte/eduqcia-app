"use client";

import { useId, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
import {
  DOCUMENT_MODULE_LEGEND_HELP_P1,
  DOCUMENT_MODULE_LEGEND_HELP_P2,
  DOCUMENT_MODULE_LEGEND_LABEL,
  DOCUMENT_MODULE_LEGEND_WORDS_ERROR,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  legendWords: number;
  showWordsError?: boolean;
};

/**
 * Champ légende — aide (i) → `SimpleModal` ; compteur sous le textarea.
 */
export function DocumentLegendTextField({
  id: idProp,
  value,
  onChange,
  legendWords,
  showWordsError,
}: Props) {
  const genId = useId();
  const fieldId = idProp ?? genId;
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <SimpleModal
        open={helpOpen}
        title={DOCUMENT_MODULE_LEGEND_LABEL}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <div className="space-y-3 text-sm leading-relaxed text-deep">
          <p>{DOCUMENT_MODULE_LEGEND_HELP_P1}</p>
          <p>{DOCUMENT_MODULE_LEGEND_HELP_P2}</p>
        </div>
      </SimpleModal>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <label htmlFor={fieldId} className="text-sm font-semibold text-deep">
            {DOCUMENT_MODULE_LEGEND_LABEL}
          </label>
          <FieldHelpModalButton onClick={() => setHelpOpen(true)} />
        </div>
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={cn(
            "w-full resize-y rounded-lg border border-border bg-panel px-3 py-2 text-sm text-deep placeholder:text-muted",
          )}
          aria-invalid={showWordsError || legendWords > 50 || undefined}
        />
        <p className="text-xs text-muted">
          {legendWords} / 50 mots
          {showWordsError || legendWords > 50 ? (
            <span className="ml-2 font-medium text-error">
              {DOCUMENT_MODULE_LEGEND_WORDS_ERROR}
            </span>
          ) : null}
        </p>
      </div>
    </>
  );
}
