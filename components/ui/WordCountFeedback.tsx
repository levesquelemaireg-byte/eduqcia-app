import type { NiveauAvertissement } from "@/lib/documents/seuils-avertissement";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Nombre de mots courant. */
  count: number;
  /** Niveau d'avertissement calculé par `evaluerTitre` / `evaluerContenuTextuel`. */
  niveau: NiveauAvertissement;
  /** Message à afficher sous le compteur. `null` si niveau neutre ou si le
   *  composant est monté avant la première saisie. */
  message: string | null;
  className?: string;
};

/**
 * Feedback compteur de mots pour les champs libres des documents historiques
 * (titre, contenu textuel). Trois états visuels alignés sur la palette design
 * system (warning = orange, error = rouge) :
 *
 * - `neutre` : pilule grise discrète, pas de message.
 * - `orange` : pilule orange + message d'avertissement doux (info).
 * - `rouge` : pilule rouge + message d'avertissement fort (warning).
 *
 * Purement informatif : ne bloque ni la saisie ni la publication. C'est à
 * l'enseignant de décider s'il raccourcit.
 */
export function WordCountFeedback({ count, niveau, message, className }: Props) {
  const pillClassName = cn(
    "inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-medium leading-none transition-[background-color,color,border-color] duration-300 ease-out",
    niveau === "neutre" && "border-transparent bg-background-secondary text-tertiary",
    niveau === "orange" &&
      "border-warning/35 bg-[color-mix(in_srgb,var(--color-warning)_18%,var(--color-panel-alt))] text-warning",
    niveau === "rouge" &&
      "border-error/35 bg-[color-mix(in_srgb,var(--color-error)_18%,var(--color-panel-alt))] text-error",
  );

  const messageClassName = cn(
    "flex items-start gap-1.5 text-xs leading-relaxed",
    niveau === "rouge" ? "text-error" : "text-warning",
  );

  const messageIcon = niveau === "rouge" ? "warning" : "info";

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className={pillClassName} aria-live="polite">
        {count === 0 ? "0 mot" : count === 1 ? "1 mot" : `${count} mots`}
      </span>
      {message ? (
        <p className={messageClassName} role="status">
          <span
            className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none"
            aria-hidden="true"
          >
            {messageIcon}
          </span>
          {message}
        </p>
      ) : null}
    </div>
  );
}
