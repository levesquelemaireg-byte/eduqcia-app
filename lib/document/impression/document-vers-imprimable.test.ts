import { describe, expect, it } from "vitest";
import type { DocumentReference } from "@/lib/tache/contrats/donnees";
import { MAX_CONTENT_HEIGHT_PX } from "@/lib/epreuve/pagination/constantes";
import { documentVersImprimable } from "./document-vers-imprimable";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function creerDoc(overrides?: Partial<DocumentReference>): DocumentReference {
  return {
    id: "doc-1",
    kind: "textuel",
    titre: "Proclamation royale de 1763",
    contenu: "<p>Contenu du document</p>",
    ...overrides,
  };
}

function mesureurFixe(hauteur: number) {
  return () => hauteur;
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("documentVersImprimable", () => {
  it("retourne un RenduImprimable ok=true avec une seule page", () => {
    const doc = creerDoc();
    const rendu = documentVersImprimable(doc, mesureurFixe(400));
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    expect(rendu.pages).toHaveLength(1);
    expect(rendu.pages[0].numeroPage).toBe(1);
    expect(rendu.pages[0].totalPages).toBe(1);
  });

  it("retourne le contexte document", () => {
    const doc = creerDoc();
    const rendu = documentVersImprimable(doc, mesureurFixe(400));
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    expect(rendu.contexte).toEqual({ type: "document" });
  });

  it("n'a pas d'en-tête", () => {
    const doc = creerDoc();
    const rendu = documentVersImprimable(doc, mesureurFixe(400));
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    expect(rendu.enTete).toBeNull();
  });

  it("conserve le titre du document (toujours visible)", () => {
    const doc = creerDoc({ titre: "Mon titre" });
    const rendu = documentVersImprimable(doc, mesureurFixe(400));
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const contenu = rendu.pages[0].blocs[0].content as { document: DocumentReference };
    expect(contenu.document.titre).toBe("Mon titre");
  });

  it("retourne une erreur si le document dépasse la page", () => {
    const doc = creerDoc();
    const hauteur = MAX_CONTENT_HEIGHT_PX + 10;
    const rendu = documentVersImprimable(doc, mesureurFixe(hauteur));
    expect(rendu.ok).toBe(false);
    if (rendu.ok) return;
    expect(rendu.erreur.kind).toBe("DEBORDEMENT_BLOC");
    expect(rendu.erreur.blocId).toBe("doc-1");
    expect(rendu.erreur.suggestion).toContain("réduisez");
  });

  it("calcule une empreinte déterministe", () => {
    const doc = creerDoc();
    const r1 = documentVersImprimable(doc, mesureurFixe(400));
    const r2 = documentVersImprimable(doc, mesureurFixe(400));
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).toBe(r2.empreinte);
  });

  it("produit des empreintes différentes pour des contenus différents", () => {
    const doc1 = creerDoc({ id: "d1", contenu: "<p>A</p>" });
    const doc2 = creerDoc({ id: "d2", contenu: "<p>B</p>" });
    const r1 = documentVersImprimable(doc1, mesureurFixe(400));
    const r2 = documentVersImprimable(doc2, mesureurFixe(400));
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).not.toBe(r2.empreinte);
  });
});
