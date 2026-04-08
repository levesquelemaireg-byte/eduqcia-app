"use client";

import { useId, useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { extractYearFromString } from "@/lib/utils/extract-year";
import {
  REPERE_TEMPOREL_EXTRACTED_PREFIX,
  REPERE_TEMPOREL_HELP,
  REPERE_TEMPOREL_LABEL,
  REPERE_TEMPOREL_MANUAL_HINT,
  REPERE_TEMPOREL_MANUAL_PLACEHOLDER,
  REPERE_TEMPOREL_MODAL_TITLE,
  REPERE_TEMPOREL_PLACEHOLDER,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  repereTemporelValue?: string;
  onRepereTemporelChange?: (value: string) => void;
  anneeNormaliseeValue?: number | null;
  onAnneeNormaliseeChange?: (value: number | null) => void;
  errorRepere?: string;
  errorAnnee?: string;
  required?: boolean;
  className?: string;
  /** Remplace le corps de la modale d’aide (ex. wizard document étape 1). */
  helpModalBodyOverride?: string;
  /** Remplace le placeholder du champ texte principal. */
  textInputPlaceholder?: string;
  /** Masque libellé + bouton (i) + modale intégrés — aide gérée par le parent. */
  suppressLabelAndHelp?: boolean;
};

export function RepereTemporelField({
  repereTemporelValue = "",
  onRepereTemporelChange,
  anneeNormaliseeValue = null,
  onAnneeNormaliseeChange,
  errorRepere,
  errorAnnee,
  required = false,
  className,
  helpModalBodyOverride,
  textInputPlaceholder,
  suppressLabelAndHelp = false,
}: Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const textId = useId();
  const manualId = useId();
  const errRepereId = `${textId}-err-repere`;
  const errAnneeId = `${manualId}-err-annee`;

  const extractedYear = extractYearFromString(repereTemporelValue);
  const hasText = repereTemporelValue.trim().length > 0;
  const hasManualAnnee = anneeNormaliseeValue != null;
  const showManualInput = extractedYear == null && (hasText || hasManualAnnee);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === "") {
      onAnneeNormaliseeChange?.(null);
      return;
    }
    const n = Number.parseInt(raw, 10);
    onAnneeNormaliseeChange?.(Number.isFinite(n) ? n : null);
  };

  return (
    <div className={cn("flex flex-col gap-[var(--space-2)]", className)}>
      {suppressLabelAndHelp ? null : (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <label htmlFor={textId} className="text-sm font-semibold text-deep">
              {REPERE_TEMPOREL_LABEL}
              {required ? (
                <>
                  {" "}
                  <RequiredMark />
                </>
              ) : null}
            </label>
            <FieldHelpModalButton onClick={() => setHelpOpen(true)} />
          </div>
          <SimpleModal
            open={helpOpen}
            onClose={() => setHelpOpen(false)}
            title={REPERE_TEMPOREL_MODAL_TITLE}
            titleStyle="info-help"
          >
            <p className="text-sm leading-relaxed text-deep">
              {helpModalBodyOverride ?? REPERE_TEMPOREL_HELP}
            </p>
          </SimpleModal>
        </>
      )}
      <input
        id={textId}
        type="text"
        value={repereTemporelValue}
        onChange={(e) => onRepereTemporelChange?.(e.target.value)}
        placeholder={textInputPlaceholder ?? REPERE_TEMPOREL_PLACEHOLDER}
        autoComplete="off"
        aria-invalid={errorRepere ? true : undefined}
        aria-describedby={
          [errorRepere ? errRepereId : "", errorAnnee ? errAnneeId : ""]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(
          "auth-input min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-panel px-3 py-2.5 text-sm text-deep placeholder:text-muted",
          errorRepere ? "border-error" : "",
        )}
      />
      {extractedYear != null ? (
        <div className="icon-text text-xs text-success">
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            calendar_today
          </span>
          <span>
            {REPERE_TEMPOREL_EXTRACTED_PREFIX}{" "}
            <strong className="text-success">{extractedYear}</strong>
          </span>
        </div>
      ) : null}
      {errorRepere ? (
        <p id={errRepereId} className="text-sm font-medium text-error" role="alert">
          {errorRepere}
        </p>
      ) : null}
      {showManualInput ? (
        <div className="mt-1 space-y-1">
          <label htmlFor={manualId} className="sr-only">
            {REPERE_TEMPOREL_MANUAL_PLACEHOLDER}
          </label>
          <input
            id={manualId}
            type="number"
            value={anneeNormaliseeValue ?? ""}
            onChange={handleManualChange}
            placeholder={REPERE_TEMPOREL_MANUAL_PLACEHOLDER}
            className={cn(
              "auth-input min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-panel px-3 py-2.5 text-sm text-deep placeholder:text-muted",
              errorAnnee ? "border-error" : "",
            )}
            aria-invalid={errorAnnee ? true : undefined}
          />
          <p className="text-xs text-muted">{REPERE_TEMPOREL_MANUAL_HINT}</p>
          {errorAnnee ? (
            <p id={errAnneeId} className="text-sm font-medium text-error" role="alert">
              {errorAnnee}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
