/**
 * Modèle pur — segments, bornes, pondérations flex (parcours ligne du temps 1.2).
 */

export type LigneDuTempsSegmentCount = 3 | 4;

const LETTERS = ["A", "B", "C", "D"] as const;

export function ligneTempsLettersForSegmentCount(n: LigneDuTempsSegmentCount): readonly string[] {
  return LETTERS.slice(0, n);
}

/** Poids flex strictement positifs à partir de bornes strictement croissantes. */
export function ligneTempsSegmentFlexWeights(boundaries: number[]): number[] {
  if (boundaries.length < 2) return [];
  const w: number[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const span = boundaries[i + 1]! - boundaries[i]!;
    w.push(Math.max(1, span));
  }
  return w;
}

/** Gabarit SVG ruban (OI 1.2) — zone utile entre les traits verticaux. */
export const LIGNE_TEMPS_RIBBON_VIEWBOX_W = 800;
export const LIGNE_TEMPS_RIBBON_ARROW_U = 40;
export const LIGNE_TEMPS_RIBBON_EDGE_MARGIN_U = 5;
export const LIGNE_TEMPS_RIBBON_USABLE_START_U =
  LIGNE_TEMPS_RIBBON_ARROW_U + LIGNE_TEMPS_RIBBON_EDGE_MARGIN_U;
export const LIGNE_TEMPS_RIBBON_USABLE_END_U =
  LIGNE_TEMPS_RIBBON_VIEWBOX_W - LIGNE_TEMPS_RIBBON_ARROW_U - LIGNE_TEMPS_RIBBON_EDGE_MARGIN_U;
export const LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U =
  LIGNE_TEMPS_RIBBON_USABLE_END_U - LIGNE_TEMPS_RIBBON_USABLE_START_U;

/**
 * Largeurs de segments en unités viewBox (zone 45–755) : min 10 % chacun, puis mise à l’échelle si dépassement.
 */
export function ligneTempsRibbonSegmentWidthsU(durations: number[]): number[] {
  const n = durations.length;
  if (n === 0) return [];
  const W = LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U;
  const total = durations.reduce((a, b) => a + b, 0);
  if (total <= 0) {
    return Array.from({ length: n }, () => W / n);
  }
  const minW = W * 0.1;
  const raw = durations.map((d) => (d / total) * W);
  const clamped = raw.map((w) => Math.max(w, minW));
  const sum = clamped.reduce((a, b) => a + b, 0);
  const scale = W / sum;
  return clamped.map((w) => w * scale);
}

/** Abscisses des traits verticaux : début, séparateurs internes, fin (inclus 45 et 755). */
export function ligneDuTempsRibbonSeparatorXsU(durations: number[]): number[] {
  const widths = ligneTempsRibbonSegmentWidthsU(durations);
  if (widths.length === 0) {
    return [LIGNE_TEMPS_RIBBON_USABLE_START_U, LIGNE_TEMPS_RIBBON_USABLE_END_U];
  }
  const positions: number[] = [LIGNE_TEMPS_RIBBON_USABLE_START_U];
  for (const w of widths) {
    positions.push(positions[positions.length - 1]! + w);
  }
  positions[positions.length - 1] = LIGNE_TEMPS_RIBBON_USABLE_END_U;
  return positions;
}

export function ligneTempsBoundariesStrictlyIncreasing(boundaries: number[]): boolean {
  for (let i = 1; i < boundaries.length; i++) {
    if (boundaries[i]! <= boundaries[i - 1]!) return false;
  }
  return true;
}

/** Cumuls en % (0–100) pour positionner les dates sous les traits. */
export function ligneTempsBoundaryPercentPositions(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const out: number[] = [0];
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i]!;
    out.push((acc / sum) * 100);
  }
  return out;
}
