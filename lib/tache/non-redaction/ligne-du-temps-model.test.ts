import { describe, expect, it } from "vitest";
import {
  ligneDuTempsRibbonSeparatorXsU,
  ligneTempsRibbonSegmentWidthsU,
  ligneTempsSegmentFlexWeights,
  LIGNE_TEMPS_RIBBON_USABLE_END_U,
  LIGNE_TEMPS_RIBBON_USABLE_START_U,
  LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U,
} from "@/lib/tache/non-redaction/ligne-du-temps-model";

describe("ligneTempsRibbonSegmentWidthsU", () => {
  it("attribue au moins 10 % de la zone utile à chaque segment et somme à la largeur utile", () => {
    const dur = ligneTempsSegmentFlexWeights([1, 2, 3, 4]);
    const w = ligneTempsRibbonSegmentWidthsU(dur);
    expect(w).toHaveLength(3);
    const sum = w.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U, 5);
    const min = LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U * 0.1;
    for (const x of w) {
      expect(x).toBeGreaterThanOrEqual(min - 1e-6);
    }
  });

  it("avec une seule durée, occupe toute la zone utile", () => {
    const w = ligneTempsRibbonSegmentWidthsU([42]);
    expect(w).toEqual([LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U]);
  });
});

describe("ligneDuTempsRibbonSeparatorXsU", () => {
  it("place les traits entre les bornes utiles 45 et 755", () => {
    const dur = ligneTempsSegmentFlexWeights([1600, 1700, 1800, 1900]);
    const xs = ligneDuTempsRibbonSeparatorXsU(dur);
    expect(xs[0]).toBe(LIGNE_TEMPS_RIBBON_USABLE_START_U);
    expect(xs[xs.length - 1]).toBe(LIGNE_TEMPS_RIBBON_USABLE_END_U);
  });
});
