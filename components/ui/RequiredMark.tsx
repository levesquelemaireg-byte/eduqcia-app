import { cn } from "@/lib/utils/cn";

/**
 * Marqueur visuel d’obligation — astérisque en couleur erreur (`--color-error`, utilitaire `text-error`).
 * Décoration uniquement : le contrôle porte `required` / `aria-required` quand c’est pertinent.
 * Voir `docs/DESIGN-SYSTEM.md` §1.1.2 et section Formulaires du même fichier.
 */
export function RequiredMark({ className = "" }: { className?: string }) {
  return (
    <span className={cn("text-error", className)} aria-hidden="true">
      *
    </span>
  );
}
