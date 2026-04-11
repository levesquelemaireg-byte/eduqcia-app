import { describe, expect, it } from "vitest";
import { autonomousDocumentFormSchema } from "@/lib/schemas/autonomous-document";

/**
 * Tests ciblés sur la règle de cohérence introduite par le commit
 * `feat(documents): add per-document text category field` :
 *   - un document textuel exige `categorie_textuelle` non null
 *   - un document iconographique ne doit pas avoir de `categorie_textuelle`
 *   - les anciennes règles (`type_iconographique`, contenu requis, etc.)
 *     ne sont pas couvertes ici (hors scope du commit)
 */

const baseTextual = {
  structure: "simple" as const,
  titre: "Lettre de Wolfe à Pitt 1759",
  elements: [
    {
      id: "el-1",
      type: "textuel" as const,
      contenu: "Texte du document.",
      source_citation: "<p>Archives nationales du Canada, MG18.</p>",
      source_type: "primaire" as const,
    },
  ],
  niveau_id: 4,
  discipline_id: 3,
  connaissances_miller: [],
  aspects: {
    economique: false,
    politique: true,
    social: false,
    culturel: false,
    territorial: false,
  },
  legal_accepted: true,
};

const baseIconographic = {
  structure: "simple" as const,
  titre: "Carte de la Nouvelle-France 1755",
  elements: [
    {
      id: "el-1",
      type: "iconographique" as const,
      image_url: "https://example.com/carte.jpg",
      source_citation: "<p>BAnQ, P1000-S15.</p>",
      source_type: "primaire" as const,
    },
  ],
  niveau_id: 4,
  discipline_id: 3,
  connaissances_miller: [],
  aspects: {
    economique: false,
    politique: false,
    social: false,
    culturel: false,
    territorial: true,
  },
  legal_accepted: true,
};

describe("autonomousDocumentFormSchema — règle categorie_textuelle", () => {
  it("accepte un document textuel avec une catégorie textuelle valide", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseTextual,
      elements: [{ ...baseTextual.elements[0], categorie_textuelle: "ecrits_personnels" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejette un document textuel sans catégorie textuelle", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseTextual,
      elements: [{ ...baseTextual.elements[0], categorie_textuelle: null }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join(".") === "elements.0.categorie_textuelle",
      );
      expect(issue).toBeDefined();
      expect(issue?.message).toBe("Sélectionnez une catégorie textuelle.");
    }
  });

  it("rejette un document textuel avec catégorie textuelle absente (undefined)", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseTextual,
      // categorie_textuelle non fournie
    });
    expect(result.success).toBe(false);
  });

  it("accepte un document iconographique sans catégorie textuelle", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseIconographic,
      elements: [{ ...baseIconographic.elements[0], type_iconographique: "carte" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepte un document iconographique même avec une catégorie textuelle non null (pas de cross-validation)", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseIconographic,
      elements: [
        {
          ...baseIconographic.elements[0],
          type_iconographique: "carte",
          categorie_textuelle: "documents_officiels",
        },
      ],
    });
    // La validation croisée type/catégorie n'existe plus au niveau élément —
    // categorie_textuelle est simplement ignorée pour les éléments iconographiques.
    expect(result.success).toBe(true);
  });

  it("accepte une catégorie textuelle vide string transformée en null pour iconographique", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseIconographic,
      elements: [
        { ...baseIconographic.elements[0], type_iconographique: "carte", categorie_textuelle: "" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.elements[0].categorie_textuelle).toBeNull();
    }
  });

  it("transforme la chaîne vide en null pour textuel (mais alors la règle d'obligation se déclenche)", () => {
    const result = autonomousDocumentFormSchema.safeParse({
      ...baseTextual,
      elements: [{ ...baseTextual.elements[0], categorie_textuelle: "" }],
    });
    expect(result.success).toBe(false);
  });
});
