import { describe, expect, it } from "vitest";
import type { RendererDocument } from "@/lib/types/document-renderer";
import {
  aplatirDocumentsAvecNumeros,
  numeroGlobalParId,
  resoudreReferencesDocuments,
} from "./renumerotation";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function creerDoc(id: string, titre: string): RendererDocument {
  return {
    id,
    titre,
    structure: "simple",
    elements: [
      {
        id,
        type: "textuel",
        contenu: `<p>Contenu de ${titre}</p>`,
        source: "",
        sourceType: "primaire",
        categorieTextuelle: "autre",
      },
    ],
  };
}

const DOC_A1 = creerDoc("a1", "Proclamation royale 1763");
const DOC_B1 = creerDoc("b1", "Acte de Québec 1774");
const DOC_A2 = creerDoc("a2", "Traité de Paris 1763");
const DOC_B2 = creerDoc("b2", "Constitution 1791");
const DOC_C2 = creerDoc("c2", "Rapport Durham");

const TACHES = [{ documents: [DOC_A1, DOC_B1] }, { documents: [DOC_A2, DOC_B2, DOC_C2] }];

/* -------------------------------------------------------------------------- */
/*  aplatirDocumentsAvecNumeros                                               */
/* -------------------------------------------------------------------------- */

describe("aplatirDocumentsAvecNumeros", () => {
  it("numérote séquentiellement les documents de toutes les tâches", () => {
    const resultat = aplatirDocumentsAvecNumeros(TACHES);
    expect(resultat).toHaveLength(5);
    expect(resultat.map((r) => r.numeroGlobal)).toEqual([1, 2, 3, 4, 5]);
    expect(resultat[0].document.id).toBe("a1");
    expect(resultat[4].document.id).toBe("c2");
  });

  it("retourne un tableau vide si aucune tâche", () => {
    expect(aplatirDocumentsAvecNumeros([])).toEqual([]);
  });

  it("retourne un tableau vide si les tâches n'ont aucun document", () => {
    expect(aplatirDocumentsAvecNumeros([{ documents: [] }])).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/*  numeroGlobalParId                                                         */
/* -------------------------------------------------------------------------- */

describe("numeroGlobalParId", () => {
  it("retourne le numéro global correct pour un document", () => {
    expect(numeroGlobalParId(TACHES, "a1")).toBe(1);
    expect(numeroGlobalParId(TACHES, "b1")).toBe(2);
    expect(numeroGlobalParId(TACHES, "a2")).toBe(3);
    expect(numeroGlobalParId(TACHES, "c2")).toBe(5);
  });

  it("retourne 0 pour un id inexistant", () => {
    expect(numeroGlobalParId(TACHES, "zzz")).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  resoudreReferencesDocuments                                               */
/* -------------------------------------------------------------------------- */

describe("resoudreReferencesDocuments", () => {
  it("remplace {{doc_A}} et {{doc_B}} par les numéros globaux", () => {
    const html = "Voir le document {{doc_A}} et le document {{doc_B}}.";
    const resultat = resoudreReferencesDocuments(html, [DOC_A2, DOC_B2, DOC_C2], TACHES);
    // DOC_A2 = global 3, DOC_B2 = global 4
    expect(resultat).toBe("Voir le document 3 et le document 4.");
  });

  it("remplace {{doc_C}} en minuscule", () => {
    const html = "Document {{doc_c}}.";
    const resultat = resoudreReferencesDocuments(html, [DOC_A2, DOC_B2, DOC_C2], TACHES);
    expect(resultat).toBe("Document 5.");
  });

  it("laisse la lettre si le document n'existe pas à cette position", () => {
    const html = "Document {{doc_D}}.";
    // La tâche 1 n'a que 2 documents (A, B) — pas de D
    const resultat = resoudreReferencesDocuments(html, [DOC_A1, DOC_B1], TACHES);
    expect(resultat).toBe("Document D.");
  });

  it("remplace les <span data-doc-ref> par les numéros globaux", () => {
    const html = '<span data-doc-ref="A">Document A</span> illustre...';
    const resultat = resoudreReferencesDocuments(html, [DOC_A1, DOC_B1], TACHES);
    expect(resultat).toBe("1 illustre...");
  });

  it("retourne une chaîne vide si html est vide", () => {
    expect(resoudreReferencesDocuments("", [DOC_A1], TACHES)).toBe("");
  });
});
