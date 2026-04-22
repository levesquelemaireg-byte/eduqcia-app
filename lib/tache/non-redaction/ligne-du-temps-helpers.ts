/**
 * Parcours ligne du temps (1.2) — segment contenant une année donnée.
 * Convention : pour N segments, `boundaries` a N+1 valeurs strictement croissantes.
 * Chaque segment i occupe [boundaries[i], boundaries[i+1]) (gauche fermée, droite ouverte).
 * Une année égale à une borne interne appartient au segment de droite.
 */

/**
 * @returns Index du segment 0 … segmentsCount-1, ou `null` si l’année n’est dans aucun segment.
 */
export function determineSegmentIndexFromYear(year: number, boundaries: number[]): number | null {
  if (!Number.isFinite(year) || boundaries.length < 2) return null;
  const n = boundaries.length - 1;
  for (let i = 0; i < n; i++) {
    const lo = boundaries[i]!;
    const hi = boundaries[i + 1]!;
    if (year >= lo && year < hi) {
      return i;
    }
  }
  return null;
}

export function segmentLetterFromIndex(
  index: number,
  letters: readonly string[],
): "A" | "B" | "C" | "D" | null {
  const L = letters[index];
  if (L === "A" || L === "B" || L === "C" || L === "D") return L;
  return null;
}

export function ligneDuTempsSegmentYearBounds(
  boundaries: number[],
  segmentIndex: number,
): { start: number; end: number } | null {
  const lo = boundaries[segmentIndex];
  const hi = boundaries[segmentIndex + 1];
  if (lo === undefined || hi === undefined || !Number.isFinite(lo) || !Number.isFinite(hi)) {
    return null;
  }
  return { start: lo, end: hi };
}
