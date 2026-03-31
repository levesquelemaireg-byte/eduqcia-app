"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  OrdreDocDigit,
  OrdreOptionRow,
} from "@/lib/tae/non-redaction/ordre-chronologique-permutations";
import { NR_ORDRE_SEQ_PIN_CELL_ARIA, NR_ORDRE_PIN_SR_HINT } from "@/lib/ui/ui-copy";

type Props = {
  row: OrdreOptionRow;
  onChange: (next: OrdreOptionRow) => void;
  groupAriaLabel: string;
  disabled?: boolean;
};

type MutableOrdreOptionRow = [
  OrdreDocDigit | null,
  OrdreDocDigit | null,
  OrdreDocDigit | null,
  OrdreDocDigit | null,
];

function updateCell(
  row: OrdreOptionRow,
  index: 0 | 1 | 2 | 3,
  digit: OrdreDocDigit | null,
): OrdreOptionRow {
  const next: MutableOrdreOptionRow = [row[0], row[1], row[2], row[3]];
  if (digit !== null) {
    for (let i = 0; i < 4; i++) {
      if (i !== index && next[i] === digit) return row;
    }
  }
  next[index] = digit;
  return next;
}

/**
 * Quatre cases pour la séquence correcte — auto-focus case suivante sur chiffre valide,
 * Backspace sur case vide ramène le focus à la case précédente.
 */
export function OrdreChronoCorrectSequencePinRow({
  row,
  onChange,
  groupAriaLabel,
  disabled = false,
}: Props) {
  const baseId = useId();
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const focusAt = (i: number) => {
    if (i >= 0 && i < 4) refs[i]!.current?.focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={groupAriaLabel}>
      {([0, 1, 2, 3] as const).map((idx) => {
        const cellId = `${baseId}-${idx}`;
        const val = row[idx];
        const showDash = idx > 0;
        return (
          <span key={idx} className="inline-flex items-center gap-2">
            {showDash ? (
              <span className="select-none text-sm text-muted" aria-hidden="true">
                –
              </span>
            ) : null}
            <input
              ref={refs[idx]}
              id={cellId}
              type="text"
              inputMode="numeric"
              pattern="[1-4]*"
              maxLength={1}
              disabled={disabled}
              autoComplete="off"
              aria-label={NR_ORDRE_SEQ_PIN_CELL_ARIA(idx + 1)}
              value={val === null ? "" : String(val)}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^1-4]/g, "");
                if (raw === "") {
                  onChange(updateCell(row, idx, null));
                  return;
                }
                const d = Number(raw.slice(-1)) as OrdreDocDigit;
                if (d !== 1 && d !== 2 && d !== 3 && d !== 4) return;
                const next = updateCell(row, idx, d);
                onChange(next);
                if (next !== row && d !== null && idx < 3) {
                  requestAnimationFrame(() => focusAt(idx + 1));
                }
              }}
              onKeyDown={(e) => {
                if (e.key !== "Backspace") return;
                const empty = val === null || val === undefined;
                if (empty) {
                  e.preventDefault();
                  focusAt(idx - 1);
                }
              }}
              className={cn(
                "h-12 w-11 rounded-lg border border-border bg-panel text-center text-lg font-semibold tabular-nums text-deep",
                "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                disabled && "cursor-not-allowed opacity-50",
              )}
              placeholder="·"
            />
          </span>
        );
      })}
      <span className="sr-only">{NR_ORDRE_PIN_SR_HINT}</span>
    </div>
  );
}
