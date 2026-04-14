import { z } from "zod";

/** Courriel institutionnel : accepte @gouv.qc.ca et @*.gouv.qc.ca (ex. @css.gouv.qc.ca). */
const institutionalEmail = z
  .string()
  .min(1, "Courriel requis")
  .email("Courriel invalide")
  .refine(
    (e) => /^[^\s@]+@([^.]+\.)*gouv\.qc\.ca$/i.test(e),
    "Seuls les courriels institutionnels (@*.gouv.qc.ca) sont acceptés",
  );

export const loginSchema = z.object({
  email: z.string().min(1, "Courriel requis").email("Courriel invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "Prénom requis"),
    last_name: z.string().min(1, "Nom requis"),
    email: institutionalEmail,
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    password_confirm: z.string().min(1, "Confirmation requise"),
    profile_type: z.enum(["enseignant", "conseiller"]),
    css_id: z.string(),
    school_id: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["password_confirm"],
      });
    }
    if (data.profile_type === "enseignant") {
      if (!data.css_id.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choisissez un centre de services scolaires",
          path: ["css_id"],
        });
      }
      if (!data.school_id.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choisissez une école secondaire",
          path: ["school_id"],
        });
      }
    }
    if (data.profile_type === "conseiller") {
      if (!data.css_id.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choisissez un centre de services scolaires",
          path: ["css_id"],
        });
      }
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Alias explicite pour la validation serveur (même schéma que le formulaire). */
export const RegisterSchema = registerSchema;

/** Renvoi d’activation — même règles que l’inscription (courriel institutionnel). */
export const resendActivationEmailSchema = z.object({
  email: institutionalEmail,
});

export type ResendActivationEmailValues = z.infer<typeof resendActivationEmailSchema>;
