"use client";

import { useCallback, useEffect, useMemo, startTransition, useState } from "react";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { OrdreChronoCorrectSequencePinRow } from "@/components/tache/non-redaction/ordre-chronologique/OrdreChronoCorrectSequencePinRow";
import { OrdreChronoOptionPinRow } from "@/components/tache/non-redaction/ordre-chronologique/OrdreChronoOptionPinRow";
import { BLOC3_SECTION_ICON } from "@/components/tache/wizard/bloc3-stepper-icons";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import {
  emptyOrdreOptionRow,
  formatOrdreOptionRowDisplay,
  generateShuffledOrdreOptionsGuarded,
  isCompleteOrdrePermutation,
  type OrdreOptionRow,
  type OrdrePermutation,
  type ShuffledOrdreOptionsData,
} from "@/lib/tache/non-redaction/ordre-chronologique-permutations";
import {
  getOrdreOptionRowForLetter,
  hasCompleteOrdreOptionsOnly,
  ordreChronologiqueCorrectPermutation,
  type OrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  buildOrdreJustificationText,
  computeOrdreSequenceFromYears,
  resolveOrdreBaseSequenceForGeneration,
} from "@/lib/tache/non-redaction/ordre-chronologique-years";
import { cn } from "@/lib/utils/cn";
import {
  NR_ORDRE_BLOC5_AUTO_SEQUENCE_LEAD,
  NR_ORDRE_BLOC5_YEAR_TIE_WARNING,
  NR_ORDRE_BLOC5_YEARS_MISSING_DETAIL,
  NR_ORDRE_BLOC5_YEARS_READY_BADGE,
  NR_ORDRE_GENERATE_CTA,
  NR_ORDRE_GENERATE_HELP,
  NR_ORDRE_JUSTIFICATION_LABEL,
  NR_ORDRE_OPTION_A_LABEL,
  NR_ORDRE_OPTION_B_LABEL,
  NR_ORDRE_OPTION_C_LABEL,
  NR_ORDRE_OPTION_D_LABEL,
  NR_ORDRE_PIN_HELP,
  NR_ORDRE_REGENERATE_CTA,
  NR_ORDRE_REGENERATE_HELP,
  NR_ORDRE_SEQ_CORRECT_BADGE,
  NR_ORDRE_SEQ_CORRIGE_SUMMARY_LABEL,
  NR_ORDRE_SEQ_CORRIGE_VALUE,
  NR_ORDRE_SEQ_RESET,
  NR_ORDRE_SEQ_STEP1_DESCRIPTION,
  NR_ORDRE_SEQ_STEP1_DESCRIPTION_AUTO,
  NR_ORDRE_SEQ_STEP1_HINT,
  NR_ORDRE_SEQ_STEP1_TITLE,
  NR_ORDRE_SEQ_STEP1_TITLE_AUTO,
  NR_ORDRE_SEQ_STEP2_DESCRIPTION,
  NR_ORDRE_SEQ_STEP2_TITLE,
} from "@/lib/ui/ui-copy";

const noopOrdreRow = (_next: OrdreOptionRow) => {};

export type SequenceOptionsGeneratorValue = Pick<
  OrdreChronologiquePayload,
  | "optionA"
  | "optionB"
  | "optionC"
  | "optionD"
  | "correctLetter"
  | "optionsJustification"
  | "manualTieBreakSequence"
>;

function optionLabel(letter: "A" | "B" | "C" | "D"): string {
  switch (letter) {
    case "A":
      return NR_ORDRE_OPTION_A_LABEL;
    case "B":
      return NR_ORDRE_OPTION_B_LABEL;
    case "C":
      return NR_ORDRE_OPTION_C_LABEL;
    default:
      return NR_ORDRE_OPTION_D_LABEL;
  }
}

function valueToResult(v: SequenceOptionsGeneratorValue): ShuffledOrdreOptionsData | null {
  if (!hasCompleteOrdreOptionsOnly(v)) return null;
  if (
    !isCompleteOrdrePermutation(v.optionA) ||
    !isCompleteOrdrePermutation(v.optionB) ||
    !isCompleteOrdrePermutation(v.optionC) ||
    !isCompleteOrdrePermutation(v.optionD)
  ) {
    return null;
  }
  const L = v.correctLetter;
  if (L !== "A" && L !== "B" && L !== "C" && L !== "D") return null;
  return {
    optionA: v.optionA,
    optionB: v.optionB,
    optionC: v.optionC,
    optionD: v.optionD,
    correctLetter: L,
  };
}

function toPayloadForPerm(v: SequenceOptionsGeneratorValue): OrdreChronologiquePayload {
  return {
    consigneTheme: "",
    optionA: v.optionA,
    optionB: v.optionB,
    optionC: v.optionC,
    optionD: v.optionD,
    correctLetter: v.correctLetter,
    optionsJustification: v.optionsJustification ?? "",
    manualTieBreakSequence: v.manualTieBreakSequence ?? null,
  };
}

type Props = {
  value: SequenceOptionsGeneratorValue;
  onChange: (patch: SequenceOptionsGeneratorValue | null) => void;
  orderedSlotIds: DocumentSlotId[];
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>;
};

export function SequenceOptionsGenerator({ value, onChange, orderedSlotIds, documents }: Props) {
  const [seqInput, setSeqInput] = useState(emptyOrdreOptionRow);
  const [displayResult, setDisplayResult] = useState<ShuffledOrdreOptionsData | null>(null);
  const [generateHelpOpen, setGenerateHelpOpen] = useState(false);
  const [regenerateHelpOpen, setRegenerateHelpOpen] = useState(false);

  const syncedFromValue = useMemo(() => valueToResult(value), [value]);
  const showStep2 = displayResult !== null || syncedFromValue !== null;
  const activeResult = displayResult ?? syncedFromValue;

  const yearRes = useMemo(
    () => computeOrdreSequenceFromYears(orderedSlotIds, documents),
    [orderedSlotIds, documents],
  );

  useEffect(() => {
    const synced = valueToResult(value);
    startTransition(() => {
      if (synced) {
        setDisplayResult(synced);
        if (yearRes.kind === "tie") {
          setSeqInput(getOrdreOptionRowForLetter(value, synced.correctLetter));
        }
      } else {
        setDisplayResult(null);
        if (
          value.manualTieBreakSequence &&
          isCompleteOrdrePermutation(value.manualTieBreakSequence)
        ) {
          setSeqInput(value.manualTieBreakSequence);
        }
      }
    });
  }, [value, yearRes.kind]);

  const handleSeqChange = useCallback(
    (next: OrdreOptionRow) => {
      if (displayResult !== null || syncedFromValue !== null) {
        setDisplayResult(null);
        onChange(null);
      }
      setSeqInput(next);
    },
    [displayResult, onChange, syncedFromValue],
  );

  const applyGeneration = useCallback(
    (base: OrdrePermutation) => {
      const gen = generateShuffledOrdreOptionsGuarded(base);
      if (!gen.ok) {
        setDisplayResult(null);
        onChange(null);
        return;
      }
      const L = gen.data.correctLetter;
      const justification = buildOrdreJustificationText(base, orderedSlotIds, documents, L);
      setDisplayResult(gen.data);
      onChange({
        optionA: gen.data.optionA,
        optionB: gen.data.optionB,
        optionC: gen.data.optionC,
        optionD: gen.data.optionD,
        correctLetter: L,
        optionsJustification: justification,
        manualTieBreakSequence: yearRes.kind === "tie" ? base : null,
      });
    },
    [documents, onChange, orderedSlotIds, yearRes.kind],
  );

  const handleGenerate = useCallback(() => {
    const base = resolveOrdreBaseSequenceForGeneration(
      yearRes,
      value.manualTieBreakSequence,
      seqInput,
    );
    if (!base) return;
    applyGeneration(base);
  }, [applyGeneration, seqInput, value.manualTieBreakSequence, yearRes]);

  const handleRegenerate = useCallback(() => {
    const correct = ordreChronologiqueCorrectPermutation(toPayloadForPerm(value));
    if (!correct) return;
    applyGeneration(correct);
  }, [applyGeneration, value]);

  const handleReset = useCallback(() => {
    setSeqInput(emptyOrdreOptionRow());
    setDisplayResult(null);
    onChange(null);
  }, [onChange]);

  const baseReady = useMemo(() => {
    return resolveOrdreBaseSequenceForGeneration(yearRes, value.manualTieBreakSequence, seqInput);
  }, [yearRes, value.manualTieBreakSequence, seqInput]);

  const canGenerate = baseReady !== null;

  const correctRow =
    showStep2 && activeResult
      ? getOrdreOptionRowForLetter(activeResult, activeResult.correctLetter)
      : null;

  const letters = ["A", "B", "C", "D"] as const;

  function rowForLetter(res: ShuffledOrdreOptionsData, L: (typeof letters)[number]) {
    switch (L) {
      case "A":
        return res.optionA;
      case "B":
        return res.optionB;
      case "C":
        return res.optionC;
      default:
        return res.optionD;
    }
  }

  const step1Block = (() => {
    if (yearRes.kind === "missing_years") {
      return (
        <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/6 p-4">
          <p className="text-sm leading-relaxed text-deep">
            {NR_ORDRE_BLOC5_YEARS_MISSING_DETAIL(yearRes.slotNumeros)}
          </p>
        </div>
      );
    }

    if (yearRes.kind === "tie") {
      return (
        <div className="space-y-3 rounded-lg border border-border bg-panel-alt/30 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-deep">
            {NR_ORDRE_SEQ_STEP1_TITLE}
          </h3>
          <p className="text-sm leading-relaxed text-warning">{NR_ORDRE_BLOC5_YEAR_TIE_WARNING}</p>
          <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_SEQ_STEP1_DESCRIPTION}</p>
          <OrdreChronoCorrectSequencePinRow
            row={seqInput}
            onChange={handleSeqChange}
            groupAriaLabel={NR_ORDRE_SEQ_STEP1_TITLE}
          />
          <p className="text-xs text-muted">{NR_ORDRE_SEQ_STEP1_HINT}</p>
          <div className="flex flex-wrap items-center gap-2">
            <SimpleModal
              open={generateHelpOpen}
              title={NR_ORDRE_GENERATE_CTA}
              onClose={() => setGenerateHelpOpen(false)}
              titleStyle="info-help"
            >
              <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_GENERATE_HELP}</p>
            </SimpleModal>
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors",
                canGenerate ? "hover:bg-panel-alt" : "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className="material-symbols-outlined text-[1em]"
                aria-hidden="true"
                title={materialIconTooltip("shuffle")}
              >
                shuffle
              </span>
              {NR_ORDRE_GENERATE_CTA}
            </button>
            <FieldHelpModalButton onClick={() => setGenerateHelpOpen(true)} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-lg border border-border bg-panel-alt/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-deep">
            {NR_ORDRE_SEQ_STEP1_TITLE_AUTO}
          </h3>
          <span className="rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
            {NR_ORDRE_BLOC5_YEARS_READY_BADGE}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_SEQ_STEP1_DESCRIPTION_AUTO}</p>
        <div className="rounded-md border border-border bg-panel px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {NR_ORDRE_BLOC5_AUTO_SEQUENCE_LEAD}
          </p>
          <p className="mt-1 font-mono text-sm font-medium text-deep">
            {formatOrdreOptionRowDisplay(yearRes.sequence)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SimpleModal
            open={generateHelpOpen}
            title={NR_ORDRE_GENERATE_CTA}
            onClose={() => setGenerateHelpOpen(false)}
            titleStyle="info-help"
          >
            <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_GENERATE_HELP}</p>
          </SimpleModal>
          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors",
              canGenerate ? "hover:bg-panel-alt" : "cursor-not-allowed opacity-50",
            )}
          >
            <span
              className="material-symbols-outlined text-[1em]"
              aria-hidden="true"
              title={materialIconTooltip("shuffle")}
            >
              shuffle
            </span>
            {NR_ORDRE_GENERATE_CTA}
          </button>
          <FieldHelpModalButton onClick={() => setGenerateHelpOpen(true)} />
        </div>
      </div>
    );
  })();

  return (
    <div className="space-y-6">
      {!showStep2 ? step1Block : null}

      {showStep2 && activeResult ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-deep">
              {NR_ORDRE_SEQ_STEP2_TITLE}
            </h3>
            <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_SEQ_STEP2_DESCRIPTION}</p>
            <p className="text-xs text-muted">{NR_ORDRE_PIN_HELP}</p>
          </div>

          <div className="space-y-4">
            {letters.map((L) => {
              const res = activeResult;
              const isCorrect = res.correctLetter === L;
              return (
                <div
                  key={L}
                  className={cn(
                    "rounded-lg border border-border bg-panel p-3",
                    isCorrect && "ring-2 ring-success/40 ring-offset-2 ring-offset-panel",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <OrdreChronoOptionPinRow
                        label={optionLabel(L)}
                        row={rowForLetter(res, L)}
                        onChange={noopOrdreRow}
                        disabled
                      />
                    </div>
                    {isCorrect ? (
                      <span className="shrink-0 rounded-md bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                        {NR_ORDRE_SEQ_CORRECT_BADGE}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {correctRow && isCompleteOrdrePermutation(correctRow) ? (
            <div className="rounded-md border border-accent/40 bg-panel px-3 py-3" role="status">
              <div className="flex gap-2">
                <span
                  className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-accent"
                  aria-hidden="true"
                  title={materialIconTooltip(BLOC3_SECTION_ICON.corrige) ?? undefined}
                >
                  {BLOC3_SECTION_ICON.corrige}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {NR_ORDRE_SEQ_CORRIGE_SUMMARY_LABEL}
                  </p>
                  <p className="mt-1 text-sm font-medium text-deep">
                    {NR_ORDRE_SEQ_CORRIGE_VALUE(
                      activeResult.correctLetter,
                      correctRow[0],
                      correctRow[1],
                      correctRow[2],
                      correctRow[3],
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {value.optionsJustification.trim() ? (
            <div className="rounded-md border border-border bg-panel-alt/40 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {NR_ORDRE_JUSTIFICATION_LABEL}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-deep">
                {value.optionsJustification.trim()}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <SimpleModal
              open={regenerateHelpOpen}
              title={NR_ORDRE_REGENERATE_CTA}
              onClose={() => setRegenerateHelpOpen(false)}
              titleStyle="info-help"
            >
              <p className="text-sm leading-relaxed text-deep">{NR_ORDRE_REGENERATE_HELP}</p>
            </SimpleModal>
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
            >
              <span
                className="material-symbols-outlined text-[1em]"
                aria-hidden="true"
                title={materialIconTooltip("shuffle")}
              >
                shuffle
              </span>
              {NR_ORDRE_REGENERATE_CTA}
            </button>
            <FieldHelpModalButton onClick={() => setRegenerateHelpOpen(true)} />
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
            >
              {NR_ORDRE_SEQ_RESET}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
