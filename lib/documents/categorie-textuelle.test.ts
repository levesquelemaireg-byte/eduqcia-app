import { describe, expect, it } from "vitest";
import {
  categorieTextuelleSchema,
  parseCategorieTextuelle,
} from "@/lib/documents/categorie-textuelle";
import { getAllCategoriesTextuelles } from "@/lib/tae/document-categories-helpers";

describe("categorieTextuelleSchema", () => {
  it("accepte les 8 valeurs canoniques", () => {
    const valid = [
      "documents_officiels",
      "ecrits_personnels",
      "presse_publications",
      "discours_prises_parole",
      "textes_savants",
      "donnees_statistiques",
      "textes_litteraires_culturels",
      "autre",
    ];
    for (const v of valid) {
      expect(categorieTextuelleSchema.safeParse(v).success).toBe(true);
    }
  });

  it("rejette les valeurs inconnues", () => {
    expect(categorieTextuelleSchema.safeParse("inconnu").success).toBe(false);
    expect(categorieTextuelleSchema.safeParse("").success).toBe(false);
    expect(categorieTextuelleSchema.safeParse(null).success).toBe(false);
  });
});

describe("parseCategorieTextuelle", () => {
  it("retourne la valeur typée pour une chaîne valide", () => {
    expect(parseCategorieTextuelle("documents_officiels")).toBe("documents_officiels");
    expect(parseCategorieTextuelle("autre")).toBe("autre");
  });

  it("retourne null pour null / undefined / vide", () => {
    expect(parseCategorieTextuelle(null)).toBeNull();
    expect(parseCategorieTextuelle(undefined)).toBeNull();
    expect(parseCategorieTextuelle("")).toBeNull();
    expect(parseCategorieTextuelle("   ")).toBeNull();
  });

  it("retourne null pour une chaîne inconnue", () => {
    expect(parseCategorieTextuelle("inconnu")).toBeNull();
    expect(parseCategorieTextuelle("Documents Officiels")).toBeNull(); // sensible à la casse
  });

  it("trim correctement les chaînes valides avec espaces", () => {
    expect(parseCategorieTextuelle("  textes_savants  ")).toBe("textes_savants");
  });
});

describe("cohérence enum SQL ↔ JSON document-categories", () => {
  it("les ids du JSON textuelles correspondent aux valeurs de l'enum Zod", () => {
    const jsonIds = getAllCategoriesTextuelles()
      .map((c) => c.id)
      .sort();
    const enumValues = [
      "autre",
      "discours_prises_parole",
      "documents_officiels",
      "donnees_statistiques",
      "ecrits_personnels",
      "presse_publications",
      "textes_litteraires_culturels",
      "textes_savants",
    ];
    expect(jsonIds).toEqual(enumValues);
  });
});
