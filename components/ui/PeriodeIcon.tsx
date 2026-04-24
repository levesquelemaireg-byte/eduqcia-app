import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

/**
 * Icône simple « période historique ».
 *
 * La taille globale suit `1em` du contexte parent (cohérent avec les
 * icônes Material Symbols du design system).
 */
export function PeriodeIcon({ className }: Props) {
  return (
    <span
      className={cn(
        "material-symbols-outlined inline-block shrink-0 text-[1em] leading-none text-accent",
        className,
      )}
      aria-hidden="true"
    >
      event_upcoming
    </span>
  );
}
