/**
 * Géométrie partagée — frise ruban SVG OI 1.2 (viewBox 800×120, clipPath).
 * Wizard `TimeLine` + HTML publié `buildLigneDuTempsTimelineHtml`.
 */

import {
  ligneDuTempsRibbonSeparatorXsU,
  ligneTempsSegmentFlexWeights,
  LIGNE_TEMPS_RIBBON_USABLE_END_U,
} from "@/lib/tache/non-redaction/ligne-du-temps-model";

export const LIGNE_TEMPS_RIBBON_VB_W = 800;
export const LIGNE_TEMPS_RIBBON_VB_H = 120;
/** Hauteur du ruban (polygone + segments), avant les traits vers les dates. */
export const LIGNE_TEMPS_RIBBON_RIBBON_H = 80;
export const LIGNE_TEMPS_RIBBON_CONNECTOR_Y2 = 98;
export const LIGNE_TEMPS_RIBBON_DATE_TEXT_Y = 114;
export const LIGNE_TEMPS_RIBBON_DATE_FONT_SIZE = 13;
export const LIGNE_TEMPS_RIBBON_DATE_FONT_WEIGHT = 600;
/** Carré lettre 32×32, centré sur le milieu du ruban (y = 40 − 16 = 24). */
export const LIGNE_TEMPS_RIBBON_LETTER_BOX_U = 32;
export const LIGNE_TEMPS_RIBBON_LETTER_BOX_TOP_U =
  LIGNE_TEMPS_RIBBON_RIBBON_H / 2 - LIGNE_TEMPS_RIBBON_LETTER_BOX_U / 2;
/** Ordonnée du centre du ruban — `text` lettre avec `dominant-baseline="central"`. */
export const LIGNE_TEMPS_RIBBON_LETTER_TEXT_CENTER_Y = LIGNE_TEMPS_RIBBON_RIBBON_H / 2;
export const LIGNE_TEMPS_RIBBON_LETTER_FONT_SIZE = 16;

/** Polygone ruban : encoche gauche, pointe droite (40 u de chaque côté). */
export const LIGNE_TEMPS_RIBBON_POLYGON_POINTS = "0,0 40,40 0,80 760,80 800,40 760,0";

export const LIGNE_TEMPS_RIBBON_TEAL_PALE = "#dff4fb";
export const LIGNE_TEMPS_RIBBON_TEAL_MED = "#7fcfe4";
export const LIGNE_TEMPS_RIBBON_TEAL_DARK = "#229bc3";
export const LIGNE_TEMPS_RIBBON_INK = "#1a1a1a";
export const LIGNE_TEMPS_RIBBON_DATE_FILL = "#444";

const RIBBON_LETTERS = ["A", "B", "C", "D"] as const;

export type LigneDuTempsRibbonFriseSegment = {
  letter: string;
  x0: number;
  x1: number;
  start: number;
  end: number;
};

export function ligneDuTempsRibbonSegmentFillU(index: number): string {
  return index % 2 === 0 ? LIGNE_TEMPS_RIBBON_TEAL_MED : LIGNE_TEMPS_RIBBON_TEAL_DARK;
}

/** @deprecated bornes sur l’ancien corps 0–740 — utiliser `ligneDuTempsRibbonSeparatorXsU` + zone 45–755. */
export const LIGNE_TEMPS_RIBBON_BODY_END = LIGNE_TEMPS_RIBBON_USABLE_END_U;

export function ligneDuTempsRibbonBoundaryXsFromBoundaries(boundaries: number[]): number[] {
  const wDur = ligneTempsSegmentFlexWeights(boundaries);
  return ligneDuTempsRibbonSeparatorXsU(wDur);
}

/**
 * Layout frise (segments, abscisses des traits) à partir des dates affichées.
 */
export function ligneDuTempsRibbonFriseLayoutFromDates(
  dates: ReadonlyArray<number>,
): { xs: number[]; segments: LigneDuTempsRibbonFriseSegment[] } | null {
  if (dates.length < 2) return null;
  const wDur = ligneTempsSegmentFlexWeights([...dates]);
  if (wDur.length === 0) return null;
  const xs = ligneDuTempsRibbonSeparatorXsU(wDur);
  const n = dates.length - 1;
  const letters = RIBBON_LETTERS.slice(0, n);
  const segments: LigneDuTempsRibbonFriseSegment[] = [];
  for (let i = 0; i < n; i++) {
    const letter = letters[i];
    if (!letter) return null;
    segments.push({
      letter,
      x0: xs[i]!,
      x1: xs[i + 1]!,
      start: dates[i]!,
      end: dates[i + 1]!,
    });
  }
  return { xs, segments };
}

/** Identifiant stable pour `clipPath` dans le HTML publié (évite collision si plusieurs frises). */
export function ligneDuTempsRibbonClipIdForBoundaries(nums: readonly number[]): string {
  const enc = nums.join("-");
  let h = 2166136261;
  for (let i = 0; i < enc.length; i++) {
    h ^= enc.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `eduqcia-lt-clip-${(h >>> 0).toString(36)}`;
}
