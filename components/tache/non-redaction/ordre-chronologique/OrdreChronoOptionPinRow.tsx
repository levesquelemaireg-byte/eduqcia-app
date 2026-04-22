"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  OrdreDocDigit,
  OrdreOptionRow,
} from "@/lib/tache/non-redaction/ordre-chronologique-permutations";
import { NR_ORDRE_PIN_CELL_ARIA, NR_ORDRE_PIN_SR_HINT } from "@/lib/ui/ui-copy";

type Props = {
  label: string;
  row: OrdreOptionRow;
  onChange: (next: OrdreOptionRow) => void;
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

export function OrdreChronoOptionPinRow({ label, row, onChange, disabled = false }: Props) {
  const baseId = useId();

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-deep">{label}</p>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
        {([0, 1, 2, 3] as const).map((idx) => {
          const cellId = `${baseId}-${idx}`;
          const val = row[idx];
          return (
            <input
              key={idx}
              id={cellId}
              type="text"
              inputMode="numeric"
              pattern="[1-4]*"
              maxLength={1}
              disabled={disabled}
              autoComplete="off"
              aria-label={NR_ORDRE_PIN_CELL_ARIA(label, idx + 1)}
              value={val === null ? "" : String(val)}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^1-4]/g, "");
                if (raw === "") {
                  onChange(updateCell(row, idx, null));
                  return;
                }
                const d = Number(raw.slice(-1)) as OrdreDocDigit;
                if (d !== 1 && d !== 2 && d !== 3 && d !== 4) return;
                onChange(updateCell(row, idx, d));
              }}
              className={cn(
                "h-12 w-11 rounded-lg border border-border bg-panel text-center text-lg font-semibold tabular-nums text-deep",
                "placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                disabled && "cursor-not-allowed opacity-50",
              )}
              placeholder="·"
            />
          );
        })}
        <span className="sr-only">{NR_ORDRE_PIN_SR_HINT}</span>
      </div>
    </div>
  );
}
