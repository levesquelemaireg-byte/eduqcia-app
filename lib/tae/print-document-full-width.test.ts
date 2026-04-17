import { describe, expect, it } from "vitest";
import {
  PRINT_DOC_FULL_WIDTH_IMAGE_PX,
  shouldPrintDocumentFullWidth,
} from "@/lib/tae/print-document-full-width";
import type { DocumentFiche } from "@/lib/types/fiche";

function makeIcono(overrides: Partial<DocumentFiche> = {}): DocumentFiche {
  return {
    letter: "A",
    titre: "Carte",
    contenu: "",
    source_citation: "",
    type: "iconographique",
    image_url: "https://example.com/img.jpg",
    imagePixelWidth: null,
    imagePixelHeight: null,
    imageLegende: null,
    imageLegendePosition: null,
    ...overrides,
  };
}

function makeTextuel(overrides: Partial<DocumentFiche> = {}): DocumentFiche {
  return {
    letter: "A",
    titre: "Document",
    contenu: "",
    source_citation: "",
    type: "textuel",
    image_url: null,
    imagePixelWidth: null,
    imagePixelHeight: null,
    imageLegende: null,
    imageLegendePosition: null,
    ...overrides,
  };
}

describe("shouldPrintDocumentFullWidth — iconographique", () => {
  it("retourne false si la largeur native est inconnue (legacy)", () => {
    expect(shouldPrintDocumentFullWidth(makeIcono({ imagePixelWidth: null }))).toBe(false);
  });

  it("retourne false si la largeur native est exactement au seuil (315 px)", () => {
    expect(
      shouldPrintDocumentFullWidth(makeIcono({ imagePixelWidth: PRINT_DOC_FULL_WIDTH_IMAGE_PX })),
    ).toBe(false);
  });

  it("retourne false si la largeur native est inférieure au seuil", () => {
    expect(shouldPrintDocumentFullWidth(makeIcono({ imagePixelWidth: 200 }))).toBe(false);
    expect(shouldPrintDocumentFullWidth(makeIcono({ imagePixelWidth: 100 }))).toBe(false);
  });

  it("retourne true si la largeur native dépasse le seuil", () => {
    expect(
      shouldPrintDocumentFullWidth(
        makeIcono({ imagePixelWidth: PRINT_DOC_FULL_WIDTH_IMAGE_PX + 1 }),
      ),
    ).toBe(true);
    expect(shouldPrintDocumentFullWidth(makeIcono({ imagePixelWidth: 660 }))).toBe(true);
    expect(shouldPrintDocumentFullWidth(makeIcono({ imagePixelWidth: 1200 }))).toBe(true);
  });
});

describe("shouldPrintDocumentFullWidth — textuel (régression)", () => {
  it("retourne false pour un texte court", () => {
    expect(shouldPrintDocumentFullWidth(makeTextuel({ contenu: "<p>Court.</p>" }))).toBe(false);
  });

  it("retourne true pour un texte très long (> 950 caractères)", () => {
    const long = "a".repeat(1000);
    expect(shouldPrintDocumentFullWidth(makeTextuel({ contenu: `<p>${long}</p>` }))).toBe(true);
  });

  it("retourne true pour un texte avec une table dans la zone intermédiaire", () => {
    const mid = "x".repeat(500);
    expect(
      shouldPrintDocumentFullWidth(
        makeTextuel({ contenu: `<p>${mid}</p><table><tr><td>cell</td></tr></table>` }),
      ),
    ).toBe(true);
  });

  it("retourne true pour une longue liste à puces", () => {
    const items = Array.from({ length: 15 }, (_, i) => `<li>item ${i}</li>`).join("");
    const filler = "x".repeat(450);
    expect(
      shouldPrintDocumentFullWidth(makeTextuel({ contenu: `<p>${filler}</p><ul>${items}</ul>` })),
    ).toBe(true);
  });
});
