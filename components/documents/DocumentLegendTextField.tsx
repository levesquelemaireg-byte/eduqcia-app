"use client";

import { useId, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { LimitCounterPill } from "@/components/ui/LimitCounterPill";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Textarea } from "@/components/ui/Textarea";
import {
  DOCUMENT_LEGEND_MAX_WORDS,
  DOCUMENT_LEGEND_WORD_WARNING_AFTER,
} from "@/lib/schemas/autonomous-document";
import {
  DOCUMENT_MODULE_LEGEND_HELP_P1,
  DOCUMENT_MODULE_LEGEND_HELP_P2,
  DOCUMENT_MODULE_LEGEND_LABEL,
  DOCUMENT_MODULE_LEGEND_WORDS_ERROR,
} from "@/lib/ui/ui-copy";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  legendWords: number;
  showWordsError?: boolean;
  placeholder?: string;
  /** Si défini : corps unique de la modale d’aide (remplace P1/P2 registre). */
  helpModalBody?: string;
  helpModalTitle?: string;
};

/**
 * Champ légende — aide (i) → `SimpleModal` ; compteur mots en pilule sur la ligne du libellé.
 */
export function DocumentLegendTextField({
  id: idProp,
  value,
  onChange,
  legendWords,
  showWordsError,
  placeholder,
  helpModalBody,
  helpModalTitle,
}: Props) {
  const genId = useId();
  const fieldId = idProp ?? genId;
  const [helpOpen, setHelpOpen] = useState(false);
  const modalTitle = helpModalTitle ?? DOCUMENT_MODULE_LEGEND_LABEL;

  return (
    <>
      <SimpleModal
        open={helpOpen}
        title={modalTitle}
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        {helpModalBody ? (
          <p className="text-sm leading-relaxed text-deep">{helpModalBody}</p>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed text-deep">
            <p>{DOCUMENT_MODULE_LEGEND_HELP_P1}</p>
            <p>{DOCUMENT_MODULE_LEGEND_HELP_P2}</p>
          </div>
        )}
      </SimpleModal>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <label htmlFor={fieldId} className="text-sm font-semibold text-deep">
              {DOCUMENT_MODULE_LEGEND_LABEL}
            </label>
            <FieldHelpModalButton onClick={() => setHelpOpen(true)} />
          </div>
          <LimitCounterPill
            current={legendWords}
            max={DOCUMENT_LEGEND_MAX_WORDS}
            warningAfter={DOCUMENT_LEGEND_WORD_WARNING_AFTER}
            unit="words"
          />
        </div>
        <Textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className="py-2"
          aria-invalid={showWordsError || legendWords > DOCUMENT_LEGEND_MAX_WORDS || undefined}
        />
        {showWordsError || legendWords > DOCUMENT_LEGEND_MAX_WORDS ? (
          <p className="text-sm text-error" role="alert">
            {DOCUMENT_MODULE_LEGEND_WORDS_ERROR}
          </p>
        ) : null}
      </div>
    </>
  );
}
