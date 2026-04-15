import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

/**
 * Icône composite « période chronologique » : calendar_today empilé
 * avec line_end_arrow_notch en léger overlay vertical.
 *
 * La taille globale suit `1em` du contexte parent (cohérent avec les
 * icônes Material Symbols du design system).
 */
export function PeriodeIcon({ className }: Props) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 flex-col items-center leading-none", className)}
      aria-hidden="true"
      style={{ width: "1em", height: "1.45em" }}
    >
      <span
        className="material-symbols-outlined text-accent"
        style={{ fontSize: "0.85em", lineHeight: 1 }}
      >
        calendar_today
      </span>
      <span
        className="material-symbols-outlined text-accent"
        style={{
          fontSize: "0.7em",
          lineHeight: 1,
          marginTop: "-0.42em",
          marginLeft: "0.4em",
        }}
      >
        line_end_arrow_notch
      </span>
    </span>
  );
}
