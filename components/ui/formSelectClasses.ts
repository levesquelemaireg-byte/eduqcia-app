import { cn } from "@/lib/utils/cn";

/**
 * Listes déroulantes — **listbox personnalisée uniquement** (`role="listbox"`).
 * Le `<select>` natif n’est plus utilisé dans l’app (uniformité, libellés multilignes).
 * Déclencheur : padding symétrique (`pl-3` / `pr-3`) — le chevron est un enfant flex, pas un fond.
 *
 * Voir `components/ui/ListboxField.tsx`, `docs/DESIGN-SYSTEM.md` (Listbox), section Formulaires §3.
 */
export const LISTBOX_TRIGGER_CLASSES =
  "auth-input flex min-h-11 w-full items-start gap-2 rounded-[var(--radius-md)] border border-border bg-panel py-2.5 pl-3 pr-3 text-left text-sm text-deep transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:cursor-pointer";

/** Panneau liste — même rendu partout (OiPicker, ComportementPicker, ListboxField). */
export const LISTBOX_DROPDOWN_PANEL_CLASSES =
  "absolute left-0 z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-panel shadow-md";

/** Ligne d’option standard (texte avec retours à la ligne possibles). */
export const LISTBOX_OPTION_ROW_CLASSES =
  "w-full border-b border-border px-3 py-2.5 text-left text-sm leading-snug text-deep last:border-b-0";

/** Concatène le déclencheur listbox + état erreur + classes locales (ex. `max-w-md`). */
export function listboxFieldClassName(options?: { error?: boolean; className?: string }): string {
  const { error, className } = options ?? {};
  return cn(LISTBOX_TRIGGER_CLASSES, error && "border-error", className);
}
