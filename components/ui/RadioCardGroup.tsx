"use client";

import { useCallback, useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RadioCardOption = {
  value: string;
  label: string;
  description?: string;
  /** Nom du glyphe Material Symbols Outlined (ex. "person"). */
  icon?: string;
  /** Option non sélectionnable (grisée, non focusable). */
  disabled?: boolean;
  /** Badge court affiché en fin de ligne (ex. « Bientôt disponible »). */
  badge?: string;
};

type Props = {
  name: string;
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2 | 3;
  required?: boolean;
  /** Label visible au-dessus du groupe (rendu comme `<legend>`). */
  label?: string;
  /** Désactive l'ensemble du groupe (blueprintLocked, submit en cours, etc.). */
  disabled?: boolean;
};

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function RadioCardGroup({
  name: _name,
  options,
  value,
  onChange,
  columns = 2,
  required,
  label,
  disabled: groupDisabled,
}: Props) {
  const groupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (groupDisabled) return;
      const isSelectable = (opt: RadioCardOption) => !opt.disabled;
      const current = options.findIndex((o) => o.value === value);
      const count = options.length;
      if (count === 0) return;
      let next = current;
      const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      if (
        !(
          e.key === "ArrowRight" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowUp"
        )
      ) {
        return;
      }
      for (let i = 0; i < count; i++) {
        next = (next + step + count) % count;
        if (isSelectable(options[next]!)) break;
      }
      if (!isSelectable(options[next]!)) return;
      e.preventDefault();
      onChange(options[next]!.value);
      const cards = containerRef.current?.querySelectorAll<HTMLElement>("[role='radio']");
      cards?.[next]?.focus();
    },
    [options, value, onChange, groupDisabled],
  );

  const colClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <fieldset className="border-0 p-0">
      {label ? (
        <legend id={groupId} className="text-sm font-medium text-deep">
          {label}
          {required ? <span className="ml-1 text-error">*</span> : null}
        </legend>
      ) : null}
      <div
        ref={containerRef}
        className={cn("mt-2 grid gap-2", colClass)}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
        aria-required={required}
        onKeyDown={handleKeyDown}
      >
        {options.map((opt) => {
          const checked = opt.value === value;
          const optDisabled = Boolean(groupDisabled || opt.disabled);
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-disabled={optDisabled || undefined}
              disabled={optDisabled}
              tabIndex={optDisabled ? -1 : checked ? 0 : -1}
              onClick={() => {
                if (optDisabled) return;
                onChange(opt.value);
              }}
              className={cn(
                "flex items-start gap-3 rounded-lg bg-panel px-5 py-4 text-left transition-all duration-200",
                checked
                  ? "border-[1.5px] border-accent shadow-[0_0_0_1px_var(--color-accent)]"
                  : "border border-border hover:border-accent/40",
                optDisabled && "cursor-not-allowed opacity-60 hover:border-border",
              )}
            >
              {/* Cercle indicateur */}
              <span
                className={cn(
                  "mt-px flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150",
                  checked ? "border-accent bg-accent" : "border-border",
                )}
              >
                {checked ? (
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="size-2.5 animate-[radio-check_150ms_cubic-bezier(0.34,1.56,0.64,1)_both]"
                  >
                    <path
                      d="M2 6.5L4.5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>

              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-1.5">
                  {opt.icon ? (
                    <span
                      className="material-symbols-outlined text-[18px] text-muted"
                      aria-hidden="true"
                    >
                      {opt.icon}
                    </span>
                  ) : null}
                  <span className="text-sm font-semibold text-deep">{opt.label}</span>
                  {opt.badge ? (
                    <span className="ml-auto rounded-full border border-border bg-panel-alt px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                      {opt.badge}
                    </span>
                  ) : null}
                </span>
                {opt.description ? (
                  <span className="whitespace-pre-line text-xs leading-relaxed text-muted">
                    {opt.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
