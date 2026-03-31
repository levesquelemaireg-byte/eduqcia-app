/**
 * Extrait la première occurrence de quatre chiffres consécutifs dans une chaîne.
 * Les dates antérieures à 1000 ou formats non numériques exigent une saisie manuelle de `annee_normalisee`.
 */
export function extractYearFromString(value: string): number | null {
  const match = value.match(/\b\d{4}\b/);
  if (!match) return null;
  const n = Number.parseInt(match[0], 10);
  return Number.isFinite(n) ? n : null;
}
