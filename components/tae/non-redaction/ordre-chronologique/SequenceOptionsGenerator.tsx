"use client";

import { useCallback, useEffect, startTransition, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { OrdreChronoCorrectSequencePinRow } from "@/components/tae/non-redaction/ordre-chronologique/OrdreChronoCorrectSequencePinRow";
import { OrdreChronoOptionPinRow } from "@/components/tae/non-redaction/ordre-chronologique/OrdreChronoOptionPinRow";
import { BLOC3_SECTION_ICON } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import {
  emptyOrdreOptionRow,
  generateShuffledOrdreOptionsGuarded,
  isCompleteOrdrePermutation,
  type OrdreOptionRow,
  type ShuffledOrdreOptionsData,
} from "@/lib/tae/non-redaction/ordre-chronologique-permutations";
import {
  getOrdreOptionRowForLetter,
  hasCompleteOrdreOptionsOnly,
  type OrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import { cn } from "@/lib/utils/cn";
import {
  NR_ORDRE_GENERATE_CTA,
  NR_ORDRE_GENERATE_HELP,
  NR_ORDRE_OPTION_A_LABEL,
  NR_ORDRE_OPTION_B_LABEL,
  NR_ORDRE_OPTION_C_LABEL,
  NR_ORDRE_OPTION_D_LABEL,
  NR_ORDRE_PIN_HELP,
  NR_ORDRE_SEQ_CORRECT_BADGE,
  NR_ORDRE_SEQ_CORRIGE_SUMMARY_LABEL,
  NR_ORDRE_SEQ_CORRIGE_VALUE,
  NR_ORDRE_SEQ_RESET,
  NR_ORDRE_SEQ_STEP1_DESCRIPTION,
  NR_ORDRE_SEQ_STEP1_HINT,
  NR_ORDRE_SEQ_STEP1_TITLE,
  NR_ORDRE_SEQ_STEP2_DESCRIPTION,
  NR_ORDRE_SEQ_STEP2_TITLE,
} from "@/lib/ui/ui-copy";

const noopOrdreRow = (_next: OrdreOptionRow) => {};

export type SequenceOptionsGeneratorValue = Pick<
  OrdreChronologiquePayload,
  "optionA" | "optionB" | "optionC" | "optionD" | "correctLetter"
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

type Props = {
  value: SequenceOptionsGeneratorValue;
  onChange: (patch: SequenceOptionsGeneratorValue | null) => void;
};

export function SequenceOptionsGenerator({ value, onChange }: Props) {
  const [seqInput, setSeqInput] = useState(emptyOrdreOptionRow);
  const [displayResult, setDisplayResult] = useState<ShuffledOrdreOptionsData | null>(null);
  const [generateHelpOpen, setGenerateHelpOpen] = useState(false);

  useEffect(() => {
    const synced = valueToResult(value);
    startTransition(() => {
      if (synced) {
        setDisplayResult(synced);
        setSeqInput(getOrdreOptionRowForLetter(value, synced.correctLetter));
      } else {
        setDisplayResult(null);
      }
    });
  }, [value]);

  const handleSeqChange = useCallback(
    (next: OrdreOptionRow) => {
      if (displayResult !== null) {
        setDisplayResult(null);
        onChange(null);
      }
      setSeqInput(next);
    },
    [displayResult, onChange],
  );

  const handleGenerate = useCallback(() => {
    if (!isCompleteOrdrePermutation(seqInput)) return;
    const gen = generateShuffledOrdreOptionsGuarded(seqInput);
    if (!gen.ok) {
      setDisplayResult(null);
      onChange(null);
      return;
    }
    setDisplayResult(gen.data);
    onChange({
      optionA: gen.data.optionA,
      optionB: gen.data.optionB,
      optionC: gen.data.optionC,
      optionD: gen.data.optionD,
      correctLetter: gen.data.correctLetter,
    });
  }, [seqInput, onChange]);

  const handleReset = useCallback(() => {
    setSeqInput(emptyOrdreOptionRow());
    setDisplayResult(null);
    onChange(null);
  }, [onChange]);

  const canGenerate = isCompleteOrdrePermutation(seqInput);
  const showStep2 = displayResult !== null;

  const correctRow =
    showStep2 && displayResult
      ? getOrdreOptionRowForLetter(displayResult, displayResult.correctLetter)
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

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-border bg-panel-alt/30 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-deep">
          {NR_ORDRE_SEQ_STEP1_TITLE}
        </h3>
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

      {showStep2 && displayResult ? (
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
              const res = displayResult;
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
                  className="material-symbols-outlined mt-0.5 shrink-0 text-[1em] text-accent"
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
                      displayResult.correctLetter,
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

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-panel px-4 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
          >
            {NR_ORDRE_SEQ_RESET}
          </button>
        </div>
      ) : null}
    </div>
  );
}
