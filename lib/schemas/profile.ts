import { z } from "zod";

/** Validation Side Sheet "Identité" (§9.2) */
export const profileIdentitySchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  schoolId: z.string().uuid("Établissement invalide").nullable(),
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
