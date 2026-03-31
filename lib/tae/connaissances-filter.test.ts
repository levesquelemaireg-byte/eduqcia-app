import { describe, expect, it } from "vitest";
import { filterConnRowsByNiveau, uniqueInOrder } from "@/lib/tae/connaissances-filter";
import type { HecConnRow, HqcConnRow } from "@/lib/tae/connaissances-types";

describe("uniqueInOrder", () => {
  it("préserve l’ordre de première apparition", () => {
    expect(uniqueInOrder([1, 2, 1, 3, 2])).toEqual([1, 2, 3]);
    expect(uniqueInOrder<string>([])).toEqual([]);
  });
});

function hecRow(
  partial: Partial<HecConnRow> & Pick<HecConnRow, "id" | "realite_sociale">,
): HecConnRow {
  return {
    kind: "hec",
    niveau: "Secondaire 1",
    section: "S",
    sous_section: null,
    enonce: "e",
    ...partial,
  };
}

function hqcRow(partial: Partial<HqcConnRow> & Pick<HqcConnRow, "id" | "periode">): HqcConnRow {
  return {
    kind: "hqc",
    niveau: "Secondaire 3",
    realite_sociale: "R",
    section: "S",
    sous_section: null,
    enonce: "e",
    ...partial,
  };
}

describe("filterConnRowsByNiveau", () => {
  it("HEC sec1 : garde les 6 premières réalités distinctes (ordre d’apparition)", () => {
    const rows: HecConnRow[] = ["A", "B", "C", "D", "E", "F", "G", "H"].map((realite_sociale, i) =>
      hecRow({ id: `r${i}`, realite_sociale }),
    );
    const out = filterConnRowsByNiveau(rows, "sec1");
    const realites = new Set(out.map((r) => r.realite_sociale));
    expect(realites.size).toBe(6);
    expect(realites.has("A")).toBe(true);
    expect(realites.has("F")).toBe(true);
    expect(realites.has("G")).toBe(false);
  });

  it("HEC sec2 : garde les 6 dernières réalités distinctes", () => {
    const rows: HecConnRow[] = ["A", "B", "C", "D", "E", "F", "G", "H"].map((realite_sociale, i) =>
      hecRow({ id: `r${i}`, realite_sociale, niveau: "Secondaire 2" }),
    );
    const out = filterConnRowsByNiveau(rows, "sec2");
    const realites = new Set(out.map((r) => r.realite_sociale));
    expect(realites.size).toBe(6);
    expect(realites.has("C")).toBe(true);
    expect(realites.has("H")).toBe(true);
    expect(realites.has("B")).toBe(false);
  });

  it("HQC sec3 : garde les 4 premières périodes distinctes", () => {
    const rows: HqcConnRow[] = ["P1", "P2", "P3", "P4", "P5", "P6"].map((periode, i) =>
      hqcRow({ id: `q${i}`, periode }),
    );
    const out = filterConnRowsByNiveau(rows, "sec3");
    const periodes = new Set(out.map((r) => r.periode));
    expect(periodes.size).toBe(4);
    expect(periodes.has("P1")).toBe(true);
    expect(periodes.has("P4")).toBe(true);
    expect(periodes.has("P5")).toBe(false);
  });

  it("retourne [] si aucune ligne pour le niveau", () => {
    const rows = [hecRow({ id: "1", realite_sociale: "X", niveau: "Secondaire 2" })];
    expect(filterConnRowsByNiveau(rows, "sec1")).toEqual([]);
  });
});
