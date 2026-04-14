"use client";

/**
 * Formulaire d'inscription — CSS et écoles chargés depuis les tables `css`/`schools`.
 * Voir `docs/ARCHITECTURE.md` (auth Next.js) et `docs/DESIGN-SYSTEM.md` (Formulaires).
 */

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerAction } from "@/lib/actions/auth-register";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { CssSchoolCascade } from "@/components/auth/CssSchoolCascade";
import type { CssOption, SchoolOption } from "@/lib/queries/css-schools";
import { Controller } from "react-hook-form";

const REGISTER_DRAFT_KEY = "eduqcia-register-draft-v1";

function defaultRegisterValues(): RegisterFormValues {
  return {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    profile_type: "enseignant",
    css_id: "",
    school_id: "",
  };
}

type Props = {
  cssList: CssOption[];
  allSchools: SchoolOption[];
};

export function RegisterForm({ cssList, allSchools }: Props) {
  const [success, setSuccess] = useState(false);
  const hydratedRef = useRef(false);
  const submitLockRef = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: defaultRegisterValues(),
  });

  const profileType = watch("profile_type");
  const cssId = watch("css_id");
  const password = watch("password");

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = sessionStorage.getItem(REGISTER_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<RegisterFormValues>;
      reset({
        ...defaultRegisterValues(),
        ...draft,
        password: "",
        password_confirm: "",
      });
    } catch {
      /* ignore */
    }
  }, [reset]);

  const formValues = watch();
  useEffect(() => {
    const { password: _p, password_confirm: _c, ...draft } = formValues;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* quota */
      }
    }, 200);
    return () => clearTimeout(id);
  }, [formValues]);

  // Reset école quand on change de CSS
  useEffect(() => {
    setValue("school_id", "");
  }, [cssId, setValue]);

  // Reset école quand on passe en conseiller
  useEffect(() => {
    if (profileType === "conseiller") {
      setValue("school_id", "");
    }
  }, [profileType, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      const result = await registerAction(data);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      if (result.ok) {
        try {
          sessionStorage.removeItem(REGISTER_DRAFT_KEY);
        } catch {
          /* ignore */
        }
        toast.success(
          "Un courriel vous a été envoyé pour activer votre compte. Vérifiez votre boîte de réception.",
        );
        setSuccess(true);
      }
    } finally {
      submitLockRef.current = false;
    }
  };

  if (success) {
    return (
      <div className="rounded-[var(--radius-md)] border border-border bg-panel-alt px-[var(--space-4)] py-[var(--space-5)] text-center">
        <span
          className="material-symbols-outlined mb-[var(--space-3)] inline-block text-[1.75rem] leading-none text-success"
          aria-hidden="true"
        >
          mark_email_read
        </span>
        <p className="text-sm font-medium leading-relaxed text-deep">
          Un courriel vous a été envoyé pour activer votre compte. Vérifiez votre boîte de
          réception.
        </p>
        <p className="mt-[var(--space-4)] text-sm text-muted">
          <Link
            href="/login"
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[var(--space-4)]"
      noValidate
    >
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <Field
          id="first_name"
          label="Prénom"
          autoComplete="given-name"
          required
          error={errors.first_name?.message}
          {...register("first_name")}
        />
        <Field
          id="last_name"
          label="Nom"
          autoComplete="family-name"
          required
          error={errors.last_name?.message}
          {...register("last_name")}
        />
      </div>
      <Field
        id="email"
        label="Courriel institutionnel"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register("email")}
      />
      <div>
        <PasswordField
          id="password"
          label="Mot de passe"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={password ?? ""} />
      </div>
      <PasswordField
        id="password_confirm"
        label="Confirmation"
        autoComplete="new-password"
        required
        error={errors.password_confirm?.message}
        {...register("password_confirm")}
      />

      <Controller
        name="profile_type"
        control={control}
        render={({ field }) => (
          <RadioCardGroup
            name="profile_type"
            label="Profil"
            required
            columns={1}
            options={[
              { value: "enseignant", label: "Enseignant(e)" },
              { value: "conseiller", label: "Conseiller(ère) pédagogique" },
            ]}
            value={field.value ?? ""}
            onChange={field.onChange}
          />
        )}
      />

      <CssSchoolCascade
        cssList={cssList}
        allSchools={allSchools}
        control={control}
        errors={errors}
        cssId={cssId}
        showSchool={profileType === "enseignant"}
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
            Envoi…
          </>
        ) : (
          "Créer mon compte"
        )}
      </Button>
      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent underline-offset-2 hover:underline"
        >
          Connexion
        </Link>
      </p>
    </form>
  );
}
