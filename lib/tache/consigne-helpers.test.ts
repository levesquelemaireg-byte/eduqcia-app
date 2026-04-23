import { describe, expect, it } from "vitest";
import {
  buildAmorceDocumentaireHtml,
  docRefSpan,
  shouldShowGuidageOnStudentSheet,
} from "@/lib/tache/consigne-helpers";

describe("consigne-helpers — shouldShowGuidageOnStudentSheet", () => {
  it("masque le guidage lorsque showGuidageOnStudentSheet est false", () => {
    expect(shouldShowGuidageOnStudentSheet("<p>Du texte</p>", false)).toBe(false);
  });

  it("affiche lorsque le drapeau est absent ou true et le HTML est significatif", () => {
    expect(shouldShowGuidageOnStudentSheet("<p>x</p>", true)).toBe(true);
    expect(shouldShowGuidageOnStudentSheet("<p>x</p>", undefined)).toBe(true);
  });

  it("n’affiche pas si le HTML est vide", () => {
    expect(shouldShowGuidageOnStudentSheet("", true)).toBe(false);
    expect(shouldShowGuidageOnStudentSheet("   ", undefined)).toBe(false);
  });
});
/* ---------- docRefSpan ---------------------------------------------------- */

describe("docRefSpan", () => {
  it("produit un span data-doc-ref avec placeholder numérique", () => {
    expect(docRefSpan(1)).toBe('<span data-doc-ref="1">{{doc_1}}</span>');
    expect(docRefSpan(3)).toBe('<span data-doc-ref="3">{{doc_3}}</span>');
  });
});

/* ---------- buildAmorceDocumentaireHtml ----------------------------------- */

describe("buildAmorceDocumentaireHtml", () => {
  it("génère l'amorce pour 1 document", () => {
    expect(buildAmorceDocumentaireHtml(1)).toContain('data-doc-ref="1"');
    expect(buildAmorceDocumentaireHtml(1)).toMatch(/^Consultez le document /);
  });

  it("génère l'amorce pour 3 documents avec virgules et « et »", () => {
    const html = buildAmorceDocumentaireHtml(3);
    expect(html).toContain('data-doc-ref="1"');
    expect(html).toContain('data-doc-ref="2"');
    expect(html).toContain('data-doc-ref="3"');
    expect(html).not.toContain('data-doc-ref="4"');
    expect(html).toContain(" et ");
  });
});
