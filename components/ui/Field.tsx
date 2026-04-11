import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { FieldLayout } from "@/components/ui/FieldLayout";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
  hint?: ReactNode;
  /** Affiche l'astérisque rouge et `aria-required` / `required` sur le champ. */
  required?: boolean;
  /** Slot à droite du label (bouton (i), compteur, etc.). */
  labelExtra?: ReactNode;
};

export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, id, error, hint, required, labelExtra, className = "", ...rest },
  ref,
) {
  return (
    <FieldLayout
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      required={required}
      labelExtra={labelExtra}
    >
      <input
        ref={ref}
        id={id}
        className={`auth-input min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-panel px-3 py-2.5 text-sm text-deep placeholder:text-muted ${
          error ? "border-error" : ""
        } ${className}`}
        {...rest}
        required={required}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </FieldLayout>
  );
});
