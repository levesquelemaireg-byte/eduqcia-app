/**
 * Bannière d'avertissement informative — non bloquante, pas de modale, pas de question.
 *
 * Usage : champs optionnels dont l'absence mérite d'être signalée (titre textuel vide,
 * source absente, débordement de page, etc.). L'enseignant voit l'info et décide seul.
 *
 * Design system : DESIGN-SYSTEM.md § Avertissements inline. Modifier l'apparence
 * **ici uniquement** pour que tous les avertissements du projet évoluent ensemble.
 */

type Props = {
  /** Texte de l'avertissement — lu depuis `lib/ui/ui-copy.ts`. */
  children: string;
  /** Icône Material Symbols Outlined. Défaut : `info`. */
  icon?: string;
  className?: string;
};

export function InlineWarning({ children, icon = "info", className }: Props) {
  return (
    <p
      className={`flex items-start gap-1.5 text-xs leading-relaxed text-warning ${className ?? ""}`}
      role="status"
    >
      <span className="material-symbols-outlined mt-0.5 shrink-0 text-[14px]" aria-hidden="true">
        {icon}
      </span>
      {children}
    </p>
  );
}
