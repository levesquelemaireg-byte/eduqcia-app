import { z } from "zod";

/** Validation Side Sheet "Identité" (§9.2) */
export const profileIdentitySchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  schoolId: z.string().uuid("Établissement invalide").nullable(),
  genre: z.enum(["homme", "femme"]).nullable(),
});

export type ProfileIdentityInput = z.infer<typeof profileIdentitySchema>;

/** Validation Side Sheet "Informations professionnelles" (§9.2) */
export const profileProfessionalSchema = z.object({
  niveaux: z.array(z.string()).max(4),
  disciplines: z.array(z.string()).max(10),
  yearsExperience: z.coerce.number().int().min(0, "Minimum 0").max(50, "Maximum 50 ans").nullable(),
});

export type ProfileProfessionalInput = z.infer<typeof profileProfessionalSchema>;

/** Validation suppression de compte (§17.5) */
export const deleteAccountSchema = z.object({
  confirmation: z.literal("SUPPRIMER"),
});

/** Validation changement de mot de passe (AUTH-1) */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    passwordConfirm: z.string().min(1, "Confirmation requise"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["passwordConfirm"],
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
