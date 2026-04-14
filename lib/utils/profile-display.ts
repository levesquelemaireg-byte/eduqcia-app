/**
 * Helpers d'affichage pour les profils (first_name + last_name).
 * Source unique de vérité pour la composition du nom affiché.
 */

/** "Prénom Nom" */
export function getDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/** "PL" (initiales majuscules) */
export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}`.trim();
}

/** "nom, prénom" pour tri alphabétique — clé de collation fr-CA */
export function getSortKey(firstName: string, lastName: string): string {
  return `${lastName.trim()}, ${firstName.trim()}`.toLowerCase();
}
