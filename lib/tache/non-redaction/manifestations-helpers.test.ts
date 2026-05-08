import { describe, expect, it } from "vitest";
import {
  emptyAssociations,
  getCategoryCount,
  getDocsPerCategory,
  getTotalDocumentCount,
  migrateCategoriesFor2,
  migrateCategoriesFor4,
  validateAssociationsNoDoublon,
} from "./manifestations-helpers";

describe("manifestations-helpers — structure", () => {
  describe("getCategoryCount", () => {
    it("retourne 2 pour 5.1 quelle que soit l'organisation", () => {
      expect(getCategoryCount("5.1", "2-categories")).toBe(2);
      expect(getCategoryCount("5.1", "4-categories")).toBe(2);
    });

    it("retourne 2 pour 5.2 + 2-categories", () => {
      expect(getCategoryCount("5.2", "2-categories")).toBe(2);
    });

    it("retourne 4 pour 5.2 + 4-categories", () => {
      expect(getCategoryCount("5.2", "4-categories")).toBe(4);
    });
  });

  describe("getDocsPerCategory", () => {
    it("retourne 1 pour 5.1", () => {
      expect(getDocsPerCategory("5.1", "2-categories")).toBe(1);
      expect(getDocsPerCategory("5.1", "4-categories")).toBe(1);
    });

    it("retourne 2 pour 5.2 + 2-categories", () => {
      expect(getDocsPerCategory("5.2", "2-categories")).toBe(2);
    });

    it("retourne 1 pour 5.2 + 4-categories", () => {
      expect(getDocsPerCategory("5.2", "4-categories")).toBe(1);
    });
  });

  describe("getTotalDocumentCount", () => {
    it("retourne 2 pour 5.1, 4 pour 5.2", () => {
      expect(getTotalDocumentCount("5.1")).toBe(2);
      expect(getTotalDocumentCount("5.2")).toBe(4);
    });
  });

  it("structure cohérente : categoryCount × docsPerCategory = totalDocCount", () => {
    const cases = [
      { c: "5.1" as const, o: "2-categories" as const },
      { c: "5.2" as const, o: "2-categories" as const },
      { c: "5.2" as const, o: "4-categories" as const },
    ];
    for (const { c, o } of cases) {
      const total = getCategoryCount(c, o) * getDocsPerCategory(c, o);
      expect(total).toBe(getTotalDocumentCount(c));
    }
  });
});

describe("manifestations-helpers — validateAssociationsNoDoublon", () => {
  it("valide 5.1 (2 cat × 1 doc) couvrant docs 1 et 2", () => {
    expect(validateAssociationsNoDoublon([[1], [2]], 2, 1, 2)).toBe(true);
    expect(validateAssociationsNoDoublon([[2], [1]], 2, 1, 2)).toBe(true);
  });

  it("rejette 5.1 si même doc assigné aux 2 catégories", () => {
    expect(validateAssociationsNoDoublon([[1], [1]], 2, 1, 2)).toBe(false);
  });

  it("rejette 5.1 si une catégorie est vide", () => {
    expect(validateAssociationsNoDoublon([[], [1]], 2, 1, 2)).toBe(false);
    expect(validateAssociationsNoDoublon([[1], []], 2, 1, 2)).toBe(false);
  });

  it("valide 5.2 + 4-categories (4 cat × 1 doc) couvrant docs 1-4", () => {
    expect(validateAssociationsNoDoublon([[1], [2], [3], [4]], 4, 1, 4)).toBe(true);
    expect(validateAssociationsNoDoublon([[3], [1], [4], [2]], 4, 1, 4)).toBe(true);
  });

  it("valide 5.2 + 2-categories (2 cat × 2 docs) couvrant docs 1-4", () => {
    expect(
      validateAssociationsNoDoublon(
        [
          [1, 3],
          [2, 4],
        ],
        2,
        2,
        4,
      ),
    ).toBe(true);
    expect(
      validateAssociationsNoDoublon(
        [
          [2, 4],
          [1, 3],
        ],
        2,
        2,
        4,
      ),
    ).toBe(true);
  });

  it("rejette 5.2 + 2-cat si doublon entre catégories", () => {
    expect(
      validateAssociationsNoDoublon(
        [
          [1, 2],
          [2, 3],
        ],
        2,
        2,
        4,
      ),
    ).toBe(false);
  });

  it("rejette 5.2 + 2-cat si doublon dans une même catégorie", () => {
    expect(
      validateAssociationsNoDoublon(
        [
          [1, 1],
          [2, 3],
        ],
        2,
        2,
        4,
      ),
    ).toBe(false);
  });

  it("rejette si numéro de doc hors plage", () => {
    expect(validateAssociationsNoDoublon([[5], [2]], 2, 1, 2)).toBe(false);
    expect(validateAssociationsNoDoublon([[0], [1]], 2, 1, 2)).toBe(false);
    expect(validateAssociationsNoDoublon([[-1], [1]], 2, 1, 2)).toBe(false);
  });

  it("rejette si nombre de catégories incorrect", () => {
    expect(validateAssociationsNoDoublon([[1], [2], [3]], 2, 1, 2)).toBe(false);
    expect(validateAssociationsNoDoublon([[1]], 2, 1, 2)).toBe(false);
  });

  it("rejette si nombre de docs par catégorie incorrect", () => {
    expect(validateAssociationsNoDoublon([[1, 2], [3]], 2, 2, 4)).toBe(false);
  });

  it("rejette les valeurs non-entières", () => {
    expect(validateAssociationsNoDoublon([[1.5], [2]], 2, 1, 2)).toBe(false);
  });
});

describe("manifestations-helpers — migrations", () => {
  it("migrateCategoriesFor4 ajoute 2 vides à la fin en conservant les 2 premières", () => {
    expect(migrateCategoriesFor4(["A", "B"])).toEqual(["A", "B", "", ""]);
  });

  it("migrateCategoriesFor4 gère un tableau vide", () => {
    expect(migrateCategoriesFor4([])).toEqual(["", "", "", ""]);
  });

  it("migrateCategoriesFor2 conserve les 2 premières (perte des 2 dernières acceptée)", () => {
    expect(migrateCategoriesFor2(["A", "B", "C", "D"])).toEqual(["A", "B"]);
  });

  it("migrateCategoriesFor2 gère un tableau plus court que 2", () => {
    expect(migrateCategoriesFor2(["A"])).toEqual(["A", ""]);
    expect(migrateCategoriesFor2([])).toEqual(["", ""]);
  });
});

describe("manifestations-helpers — emptyAssociations", () => {
  it("retourne N tableaux vides", () => {
    expect(emptyAssociations(2)).toEqual([[], []]);
    expect(emptyAssociations(4)).toEqual([[], [], [], []]);
    expect(emptyAssociations(0)).toEqual([]);
  });

  it("chaque sous-tableau est une instance distincte (pas de référence partagée)", () => {
    const result = emptyAssociations(3);
    result[0]!.push(1);
    expect(result[1]).toEqual([]);
    expect(result[2]).toEqual([]);
  });
});
