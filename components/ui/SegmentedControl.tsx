import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

/** Props du groupe segmenté — compatible `Controller` react-hook-form (`value` / `onChange`). */
export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  /** `aria-label` du groupe si pas de `aria-labelledby`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

/**
 * Switcher segmenté — conteneur sans fond ni bordure ; espacement 4px entre segments.
 * États : variables `--color-text-secondary`, `--color-background-info`, `--color-text-info` (`app/globals.css`).
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      {...(ariaLabelledby
        ? { "aria-labelledby": ariaLabelledby }
        : ariaLabel
          ? { "aria-label": ariaLabel }
          : {})}
      className={cn("flex flex-wrap gap-1", className)}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value === "" ? "__empty__" : opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex min-h-0 items-center justify-center gap-2 rounded-md border-0 px-[14px] py-2 text-[13px] font-medium transition-all duration-150",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              active
                ? "bg-[color:var(--color-background-info)] text-[color:var(--color-text-info)]"
                : "bg-transparent text-[color:var(--color-text-secondary)] hover:text-deep",
            )}
          >
            {opt.icon ? (
              <span className="shrink-0 [&_svg]:block" aria-hidden="true">
                {opt.icon}
              </span>
            ) : null}
            <span className="min-w-0">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
