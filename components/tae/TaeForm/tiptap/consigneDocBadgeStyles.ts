import { cn } from "@/lib/utils/cn";

/** Pastille Doc A / Doc B — base commune (bordure teal légère, fond accent léger). */
const consigneDocBadgeBaseClass =
  "inline-flex items-center rounded-lg border border-accent/30 bg-accent/5 font-medium text-accent";

/** Boutons d’insertion dans l’éditeur de consigne (+ glyphe `add`). */
export const CONSIGNE_DOC_INSERT_BUTTON_CLASS = cn(
  consigneDocBadgeBaseClass,
  "gap-1.5 px-3 py-1.5 text-xs transition-colors hover:border-accent hover:bg-accent/10",
);

/** Répliques statiques (sans `add`, plus compactes) pour la modale d’aide Bloc 3. */
export const CONSIGNE_DOC_HELP_MODAL_BADGE_CLASS = cn(
  consigneDocBadgeBaseClass,
  "px-2 py-0.5 text-[0.7rem] align-baseline",
);
