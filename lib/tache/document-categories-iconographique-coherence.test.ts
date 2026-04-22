import { describe, expect, it } from "vitest";
import {
  documentCategorieIconographiqueBadgeShort,
  documentCategorieIconographiqueLabel,
  getAllCategoriesIconographiques,
  getDocumentCategorieIconographique,
} from "@/lib/tache/document-categories-helpers";
import {
  parseTypeIconographique,
  typeIconographiqueSchema,
} from "@/lib/documents/type-iconographique";

/**
 * Tests de cohérence pour les helpers iconographiques (D-Coexistence Option A,
 * commit Chantier 3) :
 *   - le JSON `document-categories.json` clé `iconographiques` est la source unique
 *   - les anciens helpers `DOCUMENT_TYPE_ICONO_*` ont été supprimés de `ui-copy.ts`
 *   - le schéma Zod `typeIconographiqueSchema` reste cohérent avec les ids du JSON
 *   - les nouveaux helpers `documentCategorieIconographiqueLabel` et
 *     `documentCategorieIconographiqueBadgeShort` retournent les bonnes valeurs
 */

describe("document-categories — cohérence enum Zod ↔ JSON iconographiques", () => {
  it("les ids du JSON correspondent aux valeurs de typeIconographiqueSchema", () => {
    const jsonIds = getAllCategoriesIconographiques()
      .map((c) => c.id)
      .sort();
    const schemaValues = [...typeIconographiqueSchema.options].sort();
    expect(jsonIds).toEqual(schemaValues);
  });

  it("chaque catégorie iconographique du JSON a un badge_short non vide", () => {
    for (const cat of getAllCategoriesIconographiques()) {
      expect(typeof cat.badge_short).toBe("string");
      expect(cat.badge_short.length).toBeGreaterThan(0);
    }
  });

  it("parseTypeIconographique accepte tous les ids du JSON", () => {
    for (const cat of getAllCategoriesIconographiques()) {
      expect(parseTypeIconographique(cat.id)).toBe(cat.id);
    }
  });
});

describe("documentCategorieIconographiqueLabel", () => {
  it("retourne le label pour un id valide", () => {
    expect(documentCategorieIconographiqueLabel("carte")).toBe("Carte");
    expect(documentCategorieIconographiqueLabel("photographie")).toBe("Photographie");
    expect(documentCategorieIconographiqueLabel("peinture")).toBe("Peinture");
    expect(documentCategorieIconographiqueLabel("autre")).toBe("Autre");
  });

  it("retourne null pour null / id inconnu", () => {
    expect(documentCategorieIconographiqueLabel(null)).toBeNull();
    expect(documentCategorieIconographiqueLabel("inexistant")).toBeNull();
  });
});

describe("documentCategorieIconographiqueBadgeShort", () => {
  it("retourne le badge_short pour un id valide", () => {
    expect(documentCategorieIconographiqueBadgeShort("carte")).toBe("Carte");
    expect(documentCategorieIconographiqueBadgeShort("photographie")).toBe("Photo");
    expect(documentCategorieIconographiqueBadgeShort("dessin_gravure")).toBe("Dessin");
    expect(documentCategorieIconographiqueBadgeShort("planche_didactique")).toBe("Planche");
  });

  it("retourne null pour null / id inconnu", () => {
    expect(documentCategorieIconographiqueBadgeShort(null)).toBeNull();
    expect(documentCategorieIconographiqueBadgeShort("inexistant")).toBeNull();
  });
});

describe("getDocumentCategorieIconographique — accès direct", () => {
  it("retourne l'objet complet pour un id valide", () => {
    const cat = getDocumentCategorieIconographique("photographie");
    expect(cat).not.toBeNull();
    expect(cat?.id).toBe("photographie");
    expect(cat?.label).toBe("Photographie");
    expect(cat?.icon).toBe("photo_camera");
    expect(cat?.badge_short).toBe("Photo");
  });
});
