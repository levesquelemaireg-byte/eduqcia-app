import { cn } from "@/lib/utils/cn";

/** Surface commune — pastilles méta fiche (rectangle aux coins adoucis, sans bordure). */
export const FICHE_META_PILL_CLASS =
  "inline-flex min-h-8 items-center gap-1 rounded-lg border-0 bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep";

type Props = {
  icon: string;
  /** Absent ou vide → pastille icône seule (`ariaLabel` requis). */
  label?: string;
  className?: string;
  /** Obligatoire si pas de `label` (accessibilité). */
  ariaLabel?: string;
};

/** FICHE-TACHE.md — pastille métadonnée (OI, aspects, niveau, discipline). */
export function MetaPill({ icon, label, className = "", ariaLabel }: Props) {
  const text = label?.trim() ?? "";
  const iconOnly = text.length === 0;

  return (
    <span
      className={cn(FICHE_META_PILL_CLASS, className)}
      aria-label={iconOnly ? ariaLabel : undefined}
      role={iconOnly ? "img" : undefined}
    >
      <span className="material-symbols-outlined text-[0.9em] text-accent" aria-hidden="true">
        {icon}
      </span>
      {iconOnly ? null : text}
    </span>
  );
}
