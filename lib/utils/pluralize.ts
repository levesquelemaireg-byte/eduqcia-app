/**
 * Pluralisation française universelle.
 * Convention : 0 et 1 → singulier, 2+ → pluriel.
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count <= 1 ? singular : plural;
}
