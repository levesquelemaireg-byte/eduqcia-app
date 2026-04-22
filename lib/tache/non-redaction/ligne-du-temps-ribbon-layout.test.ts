import { describe, expect, it } from "vitest";
import {
  ligneDuTempsRibbonBoundaryXsFromBoundaries,
  ligneDuTempsRibbonFriseLayoutFromDates,
} from "@/lib/tache/non-redaction/ligne-du-temps-ribbon-layout";
import {
  LIGNE_TEMPS_RIBBON_USABLE_END_U,
  LIGNE_TEMPS_RIBBON_USABLE_START_U,
  LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U,
} from "@/lib/tache/non-redaction/ligne-du-temps-model";

describe("ligne-du-temps-ribbon-layout", () => {
  it("applique une largeur minimale de 10 % par segment puis répartit le reliquat selon les durées", () => {
    const boundaries = [1534, 1608, 1760, 1791];
    const xs = ligneDuTempsRibbonBoundaryXsFromBoundaries(boundaries);
    expect(xs).toHaveLength(4);
    expect(xs[0]).toBe(LIGNE_TEMPS_RIBBON_USABLE_START_U);
    expect(xs[3]).toBe(LIGNE_TEMPS_RIBBON_USABLE_END_U);
    for (let i = 0; i < 3; i++) {
      const w = xs[i + 1]! - xs[i]!;
      expect(w / LIGNE_TEMPS_RIBBON_USABLE_WIDTH_U).toBeGreaterThanOrEqual(0.1 - 1e-9);
    }
    const span0 = xs[1]! - xs[0]!;
    const span1 = xs[2]! - xs[1]!;
    const span2 = xs[3]! - xs[2]!;
    expect(span1).toBeGreaterThan(span0);
    expect(span1).toBeGreaterThan(span2);
  });

  it("ligneDuTempsRibbonBoundaryXsFromBoundaries sans bornes retombe sur la zone utile vide", () => {
    const xs = ligneDuTempsRibbonBoundaryXsFromBoundaries([]);
    expect(xs).toEqual([LIGNE_TEMPS_RIBBON_USABLE_START_U, LIGNE_TEMPS_RIBBON_USABLE_END_U]);
  });

  it("ligneDuTempsRibbonFriseLayoutFromDates aligne segments et bornes dates", () => {
    const layout = ligneDuTempsRibbonFriseLayoutFromDates([1600, 1700, 1800, 1900]);
    expect(layout).not.toBeNull();
    expect(layout!.segments).toHaveLength(3);
    expect(layout!.segments[0]!.letter).toBe("A");
    expect(layout!.xs).toHaveLength(4);
  });
});
