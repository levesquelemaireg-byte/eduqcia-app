/**
 * Label de rôle accordé selon le genre.
 * Masculin par défaut quand le genre n'est pas renseigné.
 */
export function getRoleLabel(role?: string | null, genre?: string | null): string {
  const fem = genre === "femme";

  if (role === "conseiller_pedagogique") {
    return fem ? "Conseillère pédagogique" : "Conseiller pédagogique";
  }

  if (role === "admin") {
    return fem ? "Administratrice" : "Administrateur";
  }

  // Default : enseignant
  return fem ? "Enseignante" : "Enseignant";
}
