import type { ReactNode } from "react";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { normalizeFrenchColonSpacing } from "@/lib/ui/colon";

type Props = {
  /** Texte du label. */
  label: string;
  /** `htmlFor` sur le label — lié au `id` du contrôle enfant. */
  htmlFor: string;
  /** Message d'erreur inline sous le contrôle. */
  error?: string;
  /** Hint ou texte d'aide sous le label. */
  hint?: ReactNode;
  /** Astérisque rouge + `aria-required` implicite. */
  required?: boolean;
  /** Slot pour contenu additionnel à droite du label (bouton (i), compteur, etc.). */
  labelExtra?: ReactNode;
  /** Le contrôle de formulaire (input, TipTap, SegmentedControl, etc.). */
  children: ReactNode;
  /** Classes additionnelles sur le conteneur racine. */
  className?: string;
};

/**
 * Layout de champ de formulaire — label + contrôle + erreur.
 *
 * Garantit un espacement et une hauteur de label uniformes dans tout le projet,
 * que le champ ait un bouton tooltip (i) ou non.
 *
 * `Field` utilise ce composant en interne pour les `<input>`.
 * Les champs custom (TipTap, SegmentedControl, Listbox, etc.) l'utilisent directement.
 */
export function FieldLayout({
  label,
  htmlFor,
  error,
  hint,
  required,
  labelExtra,
  children,
  className,
}: Props) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={className ?? "flex flex-col gap-[var(--space-2)]"}>
      <div className="flex min-h-7 items-center gap-1.5">
        <label htmlFor={htmlFor} className="text-sm font-medium leading-none text-deep">
          {normalizeFrenchColonSpacing(label)}
          {required ? (
            <>
              {" "}
              <RequiredMark />
            </>
          ) : null}
        </label>
        {labelExtra}
      </div>
      {hint}
      {children}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-error" role="alert">
          {normalizeFrenchColonSpacing(error)}
        </p>
      ) : null}
    </div>
  );
}
