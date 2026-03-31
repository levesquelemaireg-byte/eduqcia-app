import { describe, expect, it } from "vitest";
import {
  flattenDocumentsWithGlobalNumbers,
  globalDocumentNumberForLetter,
  rewriteTaeHtmlDocRefsForEvaluationPrint,
} from "@/lib/evaluations/evaluation-print-doc-map";
import type { TaeFicheData } from "@/lib/types/fiche";

function minimalFiche(
  id: string,
  docs: { letter: "A" | "B" | "C" | "D"; titre: string }[],
): TaeFicheData {
  const base = {
    id,
    auteur_id: "u",
    auteurs: [],
    consigne: "",
    guidage: "",
    corrige: "",
    aspects_societe: [],
    nb_lignes: 5,
    niveau: { label: "" },
    discipline: { label: "" },
    oi: { id: "", titre: "", icone: "cognition" },
    comportement: { id: "", enonce: "" },
    outilEvaluation: null,
    cd: null,
    connaissances: [],
    version: 1,
    version_updated_at: null,
    is_published: true,
    created_at: "",
    updated_at: "",
  };
  return {
    ...base,
    documents: docs.map((d) => ({
      letter: d.letter,
      titre: d.titre,
      contenu: "",
      source_citation: "",
      type: "textuel" as const,
      image_url: null,
      imagePixelWidth: null,
      imagePixelHeight: null,
      printImpressionScale: 1,
      imageLegende: null,
      imageLegendePosition: null,
    })),
  };
}

describe("evaluation-print-doc-map", () => {
  it("assigns global numbers across TAÉ order", () => {
    const f0 = minimalFiche("t0", [
      { letter: "A", titre: "a" },
      { letter: "B", titre: "b" },
    ]);
    const f1 = minimalFiche("t1", [{ letter: "A", titre: "c" }]);
    const fiches = [f0, f1];
    expect(globalDocumentNumberForLetter(fiches, 0, "A")).toBe(1);
    expect(globalDocumentNumberForLetter(fiches, 0, "B")).toBe(2);
    expect(globalDocumentNumberForLetter(fiches, 1, "A")).toBe(3);
    const flat = flattenDocumentsWithGlobalNumbers(fiches);
    expect(flat.map((x) => x.globalN)).toEqual([1, 2, 3]);
  });

  it("rewrites {{doc_A}} and data-doc-ref to global numbers", () => {
    const f0 = minimalFiche("t0", [{ letter: "A", titre: "x" }]);
    const f1 = minimalFiche("t1", [{ letter: "A", titre: "y" }]);
    const fiches = [f0, f1];
    const html = 'Voir {{doc_A}} et <span data-doc-ref="A">x</span>.';
    const out = rewriteTaeHtmlDocRefsForEvaluationPrint(html, 1, fiches);
    expect(out).toContain("2");
    expect(out).not.toContain("{{doc_A}}");
  });

  it("globalDocumentNumberForLetter supporte la lettre D", () => {
    const f0 = minimalFiche("t0", [
      { letter: "A", titre: "a" },
      { letter: "B", titre: "b" },
      { letter: "C", titre: "c" },
      { letter: "D", titre: "d" },
    ]);
    expect(globalDocumentNumberForLetter([f0], 0, "D")).toBe(4);
  });
});
