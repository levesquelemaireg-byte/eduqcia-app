"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
import { RequiredMark } from "@/components/ui/RequiredMark";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  id: string;
  error?: string;
  /** Affiche l’astérisque rouge et `aria-required` / `required` sur le champ. */
  required?: boolean;
};

export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { label, id, error, required, className = "", ...rest },
  ref,
) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <label htmlFor={id} className="text-sm font-medium leading-none text-deep">
        {label}
        {required ? (
          <>
            {" "}
            <RequiredMark />
          </>
        ) : null}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? "text" : "password"}
          className={`auth-input min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-panel py-2.5 pl-3 pr-11 text-sm text-deep placeholder:text-muted ${
            error ? "border-error" : ""
          } ${className}`}
          {...rest}
          required={required}
          aria-required={required ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-deep"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          <span className="material-symbols-outlined text-[22px] leading-none" aria-hidden="true">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
