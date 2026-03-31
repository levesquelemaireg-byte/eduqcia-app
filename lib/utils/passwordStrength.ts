export type PasswordStrengthLevel = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (password.length === 0) return "weak";
  if (password.length < 8) return "weak";
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 2) return "strong";
  if (score === 1) return "medium";
  return "weak";
}

export const strengthLabels: Record<PasswordStrengthLevel, string> = {
  weak: "Faible",
  medium: "Moyen",
  strong: "Fort",
};
