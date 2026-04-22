/** Clé interne pour `sous_section` null quand la colonne sous-section est affichée. */
export const SOUS_NULL = "__NULL__";

export function encSous(s: string | null): string {
  return s === null ? SOUS_NULL : s;
}
