import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { normalizeFrenchColonSpacing } from "@/lib/ui/colon";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
  hint?: ReactNode;
  /** Affiche l’astérisque rouge et `aria-required` / `required` sur le champ. */
  required?: boolean;
};

export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, id, error, hint, required, className = "", ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <label htmlFor={id} className="text-sm font-medium leading-none text-deep">
        {normalizeFrenchColonSpacing(label)}
        {required ? (
          <>
            {" "}
            <RequiredMark />
          </>
        ) : null}
      </label>
      {hint}
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
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-error" role="alert">
          {normalizeFrenchColonSpacing(error)}
        </p>
      ) : null}
    </div>
  );
});
