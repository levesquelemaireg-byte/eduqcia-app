import { describe, expect, it } from "vitest";
import {
  connaissanceRealiteLookupVariants,
  connaissancesToFicheSlice,
  hecRowToSelection,
  hqcRowToSelection,
  rowToSelectionWithIds,
  sanitizeConnaissances,
} from "@/lib/tache/connaissances-selection";
import type { HecConnRow, HqcConnRow } from "@/lib/tache/connaissances-types";

describe("connaissanceRealiteLookupVariants", () => {
  it("HEC : une seule variante (trim)", () => {
    expect(connaissanceRealiteLookupVariants("hec", "  X  ")).toEqual(["X"]);
  });

  it("HQC : ajoute la partie après le séparateur « — »", () => {
    expect(connaissanceRealiteLookupVariants("hqc", "Période — Réalité")).toEqual([
      "Période — Réalité",
      "Réalité",
    ]);
  });

  it("GEO : pas de variante spéciale", () => {
    expect(connaissanceRealiteLookupVariants("geo", "tout")).toEqual(["tout"]);
  });
});

describe("hecRowToSelection / hqcRowToSelection / rowToSelectionWithIds", () => {
  const hec: HecConnRow = {
    kind: "hec",
    id: "1",
    niveau: "Secondaire 1",
    realite_sociale: "R",
    section: "S",
    sous_section: "SS",
    enonce: "E",
  };
  const hqc: HqcConnRow = {
    kind: "hqc",
    id: "2",
    niveau: "Secondaire 3",
    periode: "P",
    realite_sociale: "RQ",
    section: "S",
    sous_section: null,
    enonce: "E",
  };

  it("mappe HEC vers ConnaissanceSelection", () => {
    expect(hecRowToSelection(hec)).toEqual({
      realite_sociale: "R",
      section: "S",
      sous_section: "SS",
      enonce: "E",
    });
  });

  it("mappe HQC avec période — réalité", () => {
    expect(hqcRowToSelection(hqc)).toEqual({
      realite_sociale: "P — RQ",
      section: "S",
      sous_section: null,
      enonce: "E",
    });
  });

  it("rowToSelectionWithIds conserve rowId", () => {
    expect(rowToSelectionWithIds(hec).rowId).toBe("1");
    expect(rowToSelectionWithIds(hqc).rowId).toBe("2");
  });
});

describe("connaissancesToFicheSlice", () => {
  it("retire rowId", () => {
    expect(
      connaissancesToFicheSlice([
        {
          rowId: "x",
          realite_sociale: "R",
          section: "S",
          sous_section: null,
          enonce: "E",
        },
      ]),
    ).toEqual([{ realite_sociale: "R", section: "S", sous_section: null, enonce: "E" }]);
  });
});

describe("sanitizeConnaissances", () => {
  it("ignore les entrées invalides", () => {
    expect(sanitizeConnaissances(null)).toEqual([]);
    expect(sanitizeConnaissances([{ rowId: "a" }])).toEqual([]);
  });

  it("accepte une ligne valide et dérive rowId si absent", () => {
    const out = sanitizeConnaissances([
      {
        realite_sociale: "R",
        section: "S",
        sous_section: null,
        enonce: "E",
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].realite_sociale).toBe("R");
    expect(out[0].rowId.startsWith("derived:")).toBe(true);
  });
});
