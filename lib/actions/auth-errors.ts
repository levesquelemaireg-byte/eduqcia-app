export type AuthErrorCode =
  | "empty"
  | "invalid"
  | "inactive"
  | "password_mismatch"
  | "password_too_short"
  | "email_exists"
  | "email_not_allowed"
  | "failed"
  | "empty_fields"
  | "validation";

/** Messages utilisateur alignés sur les codes d’erreur auth (Server Actions). */
export const authErrorMessages: Record<AuthErrorCode, string> = {
  empty: "Veuillez remplir tous les champs.",
  invalid: "Email ou mot de passe incorrect.",
  inactive: "Compte non activé. Vérifiez votre courriel.",
  password_mismatch: "Les mots de passe ne correspondent pas.",
  password_too_short: "Le mot de passe doit contenir au moins 8 caractères.",
  email_exists: "Cet email est déjà utilisé.",
  email_not_allowed: "Seuls les courriels institutionnels (@*.gouv.qc.ca) sont acceptés.",
  failed: "Erreur lors de l'inscription. Réessayez.",
  empty_fields: "Veuillez remplir tous les champs.",
  validation: "Données invalides.",
};

export function authSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
