/** Comptage mots (séparateur espaces) — validation légende 50 mots max (`docs/FEATURES.md` §5.6). */
export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}
