"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions/auth-login";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";

type Props = {
  nextPath: string;
  errorParam?: string | null;
};

export function LoginForm({ nextPath, errorParam }: Props) {
  const submitLockRef = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    if (errorParam === "callback" && typeof window !== "undefined") {
      toast.error("Lien de confirmation invalide ou expiré.");
      window.history.replaceState(null, "", "/login");
    }
  }, [errorParam]);

  const onSubmit = async (data: LoginFormValues) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      const result = await loginAction({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        next: nextPath,
      });

      if ("error" in result && result.error) {
        toast.error(result.error.message);
        return;
      }

      if ("ok" in result && result.ok) {
        window.location.href = result.redirectTo;
      }
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[var(--space-4)]"
      noValidate
    >
      <Field
        id="email"
        label="Courriel"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        id="password"
        label="Mot de passe"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register("password")}
      />
      <Controller
        name="remember"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-[var(--space-2)]">
            <input
              id="login-remember"
              type="checkbox"
              className="size-4 shrink-0 rounded border-border accent-[var(--color-accent)]"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            <label
              htmlFor="login-remember"
              className="cursor-pointer text-sm font-medium text-steel"
            >
              Se souvenir de moi
            </label>
          </div>
        )}
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-[var(--space-1)] flex w-full items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span
              className="material-symbols-outlined animate-spin text-lg leading-none"
              aria-hidden="true"
            >
              progress_activity
            </span>
            Connexion…
          </>
        ) : (
          "Connexion"
        )}
      </Button>
      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent underline-offset-2 hover:underline"
        >
          S’inscrire
        </Link>
      </p>
    </form>
  );
}
