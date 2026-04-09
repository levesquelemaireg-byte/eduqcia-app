import { describe, expect, it } from "vitest";
import {
  getAllCategoriesIconographiques,
  getAllCategoriesTextuelles,
  getAllTypesSource,
  getCategoryIcon,
  getDocumentCategorieIconographique,
  getDocumentCategorieTextuelle,
  getDocumentTypeIcon,
  getDocumentTypeSource,
} from "@/lib/tae/document-categories-helpers";

describe("document-categories-helpers — catégories textuelles", () => {
  it("liste toutes les catégories textuelles", () => {
    const list = getAllCategoriesTextuelles();
    expect(list.length).toBeGreaterThanOrEqual(7);
    expect(list.every((c) => typeof c.id === "string" && c.id.length > 0)).toBe(true);
    expect(list.every((c) => typeof c.label === "string" && c.label.length > 0)).toBe(true);
    expect(list.every((c) => typeof c.icon === "string" && c.icon.length > 0)).toBe(true);
  });

  it("retourne une catégorie textuelle par id valide", () => {
    const cat = getDocumentCategorieTextuelle("documents_officiels");
    expect(cat).not.toBeNull();
    expect(cat?.label).toBe("Documents officiels");
    expect(cat?.icon).toBe("gavel");
  });

  it("retourne null pour un id textuel inconnu", () => {
    expect(getDocumentCategorieTextuelle("inexistant")).toBeNull();
    expect(getDocumentCategorieTextuelle("")).toBeNull();
  });

  it("inclut une catégorie 'autre' textuelle avec icône article", () => {
    const autre = getDocumentCategorieTextuelle("autre");
    expect(autre).not.toBeNull();
    expect(autre?.icon).toBe("article");
  });
});

describe("document-categories-helpers — catégories iconographiques", () => {
  it("liste toutes les catégories iconographiques", () => {
    const list = getAllCategoriesIconographiques();
    expect(list.length).toBeGreaterThanOrEqual(8);
    expect(list.every((c) => typeof c.id === "string" && c.id.length > 0)).toBe(true);
    expect(list.every((c) => typeof c.label === "string" && c.label.length > 0)).toBe(true);
    expect(list.every((c) => typeof c.icon === "string" && c.icon.length > 0)).toBe(true);
  });

  it("retourne une catégorie iconographique par id valide", () => {
    const cat = getDocumentCategorieIconographique("photographie");
    expect(cat).not.toBeNull();
    expect(cat?.label).toBe("Photographie");
    expect(cat?.icon).toBe("photo_camera");
  });

  it("retourne null pour un id iconographique inconnu", () => {
    expect(getDocumentCategorieIconographique("inexistant")).toBeNull();
    expect(getDocumentCategorieIconographique("")).toBeNull();
  });

  it("inclut une catégorie 'autre' iconographique avec icône image_inset", () => {
    const autre = getDocumentCategorieIconographique("autre");
    expect(autre).not.toBeNull();
    expect(autre?.icon).toBe("image_inset");
  });
});

describe("document-categories-helpers — types de source", () => {
  it("liste exactement deux types de source : primaire et secondaire", () => {
    const list = getAllTypesSource();
    expect(list).toHaveLength(2);
    const ids = list.map((t) => t.id).sort();
    expect(ids).toEqual(["primaire", "secondaire"]);
  });

  it("retourne le type primaire avec icône counter_1", () => {
    const t = getDocumentTypeSource("primaire");
    expect(t).not.toBeNull();
    expect(t?.label).toBe("Primaire");
    expect(t?.icon).toBe("counter_1");
  });

  it("retourne le type secondaire avec icône counter_2", () => {
    const t = getDocumentTypeSource("secondaire");
    expect(t).not.toBeNull();
    expect(t?.label).toBe("Secondaire");
    expect(t?.icon).toBe("counter_2");
  });

  it("retourne null pour un type de source inconnu", () => {
    expect(getDocumentTypeSource("primaire_secondaire")).toBeNull();
    expect(getDocumentTypeSource("")).toBeNull();
  });
});

describe("document-categories-helpers — getCategoryIcon", () => {
  it("résout un id textuel vers son icône", () => {
    expect(getCategoryIcon("documents_officiels")).toBe("gavel");
    expect(getCategoryIcon("ecrits_personnels")).toBe("edit_note");
  });

  it("résout un id iconographique vers son icône", () => {
    expect(getCategoryIcon("carte")).toBe("map");
    expect(getCategoryIcon("peinture")).toBe("palette");
  });

  it("retourne null pour un id totalement inconnu", () => {
    expect(getCategoryIcon("inexistant")).toBeNull();
    expect(getCategoryIcon("")).toBeNull();
  });

  it("résout 'autre' textuel et 'autre' iconographique vers des icônes différentes", () => {
    // Note : les deux ids sont identiques ('autre'), mais les helpers
    // dédiés textuel/iconographique permettent de désambiguïser quand le contexte
    // est connu. getCategoryIcon retourne la première occurrence trouvée (textuelle).
    const fromGeneric = getCategoryIcon("autre");
    expect(fromGeneric).toBe("article"); // textuel trouvé en premier
    expect(getDocumentCategorieIconographique("autre")?.icon).toBe("image_inset");
  });
});

describe("document-categories-helpers — getDocumentTypeIcon", () => {
  it("retourne 'article' pour un document textuel", () => {
    expect(getDocumentTypeIcon("textuel")).toBe("article");
  });

  it("retourne 'image_inset' pour un document iconographique", () => {
    expect(getDocumentTypeIcon("iconographique")).toBe("image_inset");
  });
});

describe("document-categories-helpers — cohérence globale", () => {
  it("tous les ids textuels sont uniques", () => {
    const ids = getAllCategoriesTextuelles().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tous les ids iconographiques sont uniques", () => {
    const ids = getAllCategoriesIconographiques().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
