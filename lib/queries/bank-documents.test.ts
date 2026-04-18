import { describe, expect, it } from "vitest";
import {
  serializeBankDocumentsQueryForHref,
  parseBankDocumentIconoCategories,
} from "@/lib/queries/bank-documents";
import type { BankDocumentFilters } from "@/lib/queries/bank-documents";

describe("serializeBankDocumentsQueryForHref", () => {
  it("génère l'URL de base sans filtres", () => {
    const url = serializeBankDocumentsQueryForHref({}, 0);
    expect(url).toBe("/bank?onglet=documents");
  });

  it("inclut le paramètre de recherche", () => {
    const url = serializeBankDocumentsQueryForHref({ search: "carte" }, 0);
    expect(url).toContain("q=carte");
    expect(url).toContain("onglet=documents");
  });

  it("trim la recherche et ignore les espaces vides", () => {
    const url = serializeBankDocumentsQueryForHref({ search: "   " }, 0);
    expect(url).not.toContain("q=");
  });

  it("inclut discipline et niveau", () => {
    const filters: BankDocumentFilters = { disciplineId: 1, niveauId: 3 };
    const url = serializeBankDocumentsQueryForHref(filters, 0);
    expect(url).toContain("discipline=1");
    expect(url).toContain("niveau=3");
  });

  it("inclut le type de document", () => {
    const url = serializeBankDocumentsQueryForHref({ docType: "iconographique" }, 0);
    expect(url).toContain("dtype=iconographique");
  });

  it("inclut les catégories icono multiples", () => {
    const filters: BankDocumentFilters = {
      iconoCategories: ["carte", "photographie"],
    };
    const url = serializeBankDocumentsQueryForHref(filters, 0);
    expect(url).toContain("icat=carte");
    expect(url).toContain("icat=photographie");
  });

  it("n'ajoute pas de page pour page=0", () => {
    const url = serializeBankDocumentsQueryForHref({}, 0);
    expect(url).not.toContain("page=");
  });

  it("ajoute le numéro de page pour page > 0", () => {
    const url = serializeBankDocumentsQueryForHref({}, 2);
    expect(url).toContain("page=2");
  });

  it("combine tous les filtres", () => {
    const filters: BankDocumentFilters = {
      search: "test",
      disciplineId: 2,
      niveauId: 1,
      docType: "textuel",
    };
    const url = serializeBankDocumentsQueryForHref(filters, 3);
    expect(url).toContain("onglet=documents");
    expect(url).toContain("q=test");
    expect(url).toContain("discipline=2");
    expect(url).toContain("niveau=1");
    expect(url).toContain("dtype=textuel");
    expect(url).toContain("page=3");
  });
});

describe("parseBankDocumentIconoCategories", () => {
  it("retourne un tableau vide si pas de paramètre icat", () => {
    expect(parseBankDocumentIconoCategories({})).toEqual([]);
  });

  it("retourne un tableau vide pour undefined", () => {
    expect(parseBankDocumentIconoCategories({ icat: undefined })).toEqual([]);
  });

  it("parse une valeur unique valide", () => {
    expect(parseBankDocumentIconoCategories({ icat: "carte" })).toEqual(["carte"]);
  });

  it("parse un tableau de valeurs valides", () => {
    const result = parseBankDocumentIconoCategories({
      icat: ["carte", "photographie", "peinture"],
    });
    expect(result).toEqual(["carte", "photographie", "peinture"]);
  });

  it("filtre les valeurs invalides", () => {
    const result = parseBankDocumentIconoCategories({
      icat: ["carte", "invalide", "photographie"],
    });
    expect(result).toEqual(["carte", "photographie"]);
  });

  it("retourne vide si toutes les valeurs sont invalides", () => {
    const result = parseBankDocumentIconoCategories({
      icat: ["invalide", "aussi_invalide"],
    });
    expect(result).toEqual([]);
  });

  it("gère une chaîne invalide unique", () => {
    expect(parseBankDocumentIconoCategories({ icat: "inexistant" })).toEqual([]);
  });

  it("accepte toutes les catégories iconographiques valides", () => {
    const valid = [
      "carte",
      "photographie",
      "peinture",
      "dessin_gravure",
      "affiche_caricature",
      "planche_didactique",
      "objet_artefact",
      "autre",
    ];
    const result = parseBankDocumentIconoCategories({ icat: valid });
    expect(result).toEqual(valid);
  });
});
