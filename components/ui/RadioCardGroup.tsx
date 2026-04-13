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
}: Props) {
  const groupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = options.findIndex((o) => o.value === value);
      let next = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = (idx + 1) % options.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = (idx - 1 + options.length) % options.length;
      } else {
        return;
      }
      e.preventDefault();
      onChange(options[next]!.value);
      const cards = containerRef.current?.querySelectorAll<HTMLElement>("[role='radio']");
      cards?.[next]?.focus();
    },
    [options, value, onChange],
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
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-start gap-2 rounded-md px-3 py-2.5 text-left transition-colors duration-150",
                checked
                  ? "border-[1.5px] border-[color:var(--color-border-success)] bg-[color:var(--color-background-success)]"
                  : "border-[0.5px] border-[color:var(--color-border)] bg-surface hover:border-[color:var(--color-border-secondary)]",
              )}
            >
              {/* Cercle indicateur */}
              <span
                className={cn(
                  "mt-px flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150",
                  checked
                    ? "border-[color:var(--color-success)] bg-[color:var(--color-success)]"
                    : "border-[color:var(--color-border)]",
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

              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  {opt.icon ? (
                    <span
                      className="material-symbols-outlined text-[16px] text-muted"
                      aria-hidden="true"
                    >
                      {opt.icon}
                    </span>
                  ) : null}
                  <span className="text-[13px] font-medium text-deep">{opt.label}</span>
                </span>
                {opt.description ? (
                  <span className="pl-0 text-xs leading-relaxed text-muted">{opt.description}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
