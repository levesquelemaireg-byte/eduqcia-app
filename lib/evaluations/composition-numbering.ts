/**
 * Numérotation continue des documents (dossier documentaire) selon l’ordre des TAÉ.
 * Chaque TAÉ contribue `nbDocuments` entrées (Doc 1…n continus sur toute l’épreuve).
 */
export function cumulativeDocRanges(nbDocsPerTae: number[]): { from: number; to: number }[] {
  let acc = 0;
  return nbDocsPerTae.map((n) => {
    const safe = Math.max(0, Math.floor(n));
    if (safe === 0) {
      return { from: 0, to: 0 };
    }
    const from = acc + 1;
    const to = acc + safe;
    acc = to;
    return { from, to };
  });
}

/** Libellé affichage « Doc a » ou « Docs a–b » (a = b → singulier). */
export function formatDocRangeLabel(range: { from: number; to: number }): string {
  if (range.from <= 0 || range.to <= 0 || range.to < range.from) return "—";
  if (range.from === range.to) return `Doc ${range.from}`;
  return `Docs ${range.from}–${range.to}`;
}

/** Une question par TAÉ dans l’ordre de composition (questionnaire continu). */
export function questionIndexForSlot(orderIndex: number): number {
  return orderIndex + 1;
}
