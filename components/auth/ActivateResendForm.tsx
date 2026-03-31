"use client";

import { useActionState } from "react";
import { resendActivationAction } from "@/lib/actions/auth-resend";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function ActivateResendForm() {
  const [state, formAction, pending] = useActionState(resendActivationAction, null);

  if (state?.ok) {
    return (
      <p className="text-sm text-success">
        Si cette adresse est valide et en attente d’activation, un nouveau courriel a été envoyé.
      </p>
    );
  }

  const fieldError = state?.error?.message;

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <Field
        id="resend-email"
        name="email"
        type="email"
        label="Courriel"
        autoComplete="email"
        required
        error={fieldError}
      />
      <Button
        type="submit"
        disabled={pending}
        className="flex w-fit items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <span
              className="material-symbols-outlined animate-spin text-lg leading-none"
              aria-hidden="true"
            >
              progress_activity
            </span>
            Envoi…
          </>
        ) : (
          "Renvoyer"
        )}
      </Button>
    </form>
  );
}
