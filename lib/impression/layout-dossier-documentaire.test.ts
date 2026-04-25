import { describe, expect, it } from "vitest";
import {
  deriverMetriquesDocument,
  determinerSpan,
  estimerHauteur,
  placerDocuments,
  type DocumentAPositionner,
} from "@/lib/impression/layout-dossier-documentaire";
import { HAUTEUR_UTILE_HORS_EPREUVE_PX } from "@/lib/impression/constantes-dossier-documentaire";
import type { RendererDocument } from "@/lib/types/document-renderer";

// ---------------------------------------------------------------------------
// Factories de tests
// ---------------------------------------------------------------------------

function motsRepetes(n: number): string {
  return Array.from({ length: n }, (_, i) => `mot${i}`).join(" ");
}

function docTextuel(
  numero: number,
  nombreMots: number,
  opts: { titre?: string | null } = {},
): DocumentAPositionner {
  return {
    id: `doc-${numero}`,
    numero,
    type: "textuel",
    structure: "simple",
    titre: opts.titre === undefined ? "Titre" : opts.titre,
    nombreMots,
    imageRatio: null,
  };
}

function docIconographique(
  numero: number,
  imageRatio: number,
  opts: { titre?: string | null } = {},
): DocumentAPositionner {
  return {
    id: `doc-${numero}`,
    numero,
    type: "iconographique",
    structure: "simple",
    titre: opts.titre === undefined ? "Titre" : opts.titre,
    nombreMots: 0,
    imageRatio,
  };
}

function rendererTextuel(id: string, titre: string, contenuHtml: string): RendererDocument {
  return {
    id,
    titre,
    structure: "simple",
    elements: [
      {
        id: `${id}-e1`,
        type: "textuel",
        contenu: contenuHtml,
        categorieTextuelle: "ecrits_personnels",
        source: "<p>Archives</p>",
        sourceType: "primaire",
      },
    ],
  };
}

function rendererIconographique(
  id: string,
  titre: string,
  dims: { w?: number; h?: number } = {},
): RendererDocument {
  return {
    id,
    titre,
    structure: "simple",
    elements: [
      {
        id: `${id}-e1`,
        type: "iconographique",
        imageUrl: "https://example.com/img.jpg",
        categorieIconographique: "carte",
        source: "<p>Source</p>",
        sourceType: "primaire",
        imagePixelWidth: dims.w,
        imagePixelHeight: dims.h,
      },
    ],
  };
}

const OPT_LARGE = { hauteurUtilePx: HAUTEUR_UTILE_HORS_EPREUVE_PX };

// ---------------------------------------------------------------------------
// deriverMetriquesDocument
// ---------------------------------------------------------------------------

describe("deriverMetriquesDocument", () => {
  it("compte les mots du contenu HTML strippé pour un document textuel", () => {
    const doc = rendererTextuel("d1", "Titre", "<p>un deux <strong>trois</strong> quatre</p>");
    const m = deriverMetriquesDocument(doc, 1);
    expect(m.nombreMots).toBe(4);
    expect(m.type).toBe("textuel");
    expect(m.imageRatio).toBeNull();
  });

  it("calcule le ratio h/w pour un document iconographique avec dimensions", () => {
    const doc = rendererIconographique("d1", "Titre", { w: 1000, h: 500 });
    const m = deriverMetriquesDocument(doc, 1);
    expect(m.imageRatio).toBe(0.5);
    expect(m.type).toBe("iconographique");
    expect(m.nombreMots).toBe(0);
  });

  it("fallback ratio = 1 pour un document iconographique sans dimensions", () => {
    const doc = rendererIconographique("d1", "Titre");
    const m = deriverMetriquesDocument(doc, 1);
    expect(m.imageRatio).toBe(1);
  });

  it("masque le titre en mode sommatif (titreVisible: false)", () => {
    const doc = rendererTextuel("d1", "Titre visible", "<p>contenu</p>");
    const m = deriverMetriquesDocument(doc, 1, { titreVisible: false });
    expect(m.titre).toBeNull();
  });

  it("titre absent en saisie → titre null", () => {
    const doc = rendererTextuel("d1", "   ", "<p>contenu</p>");
    const m = deriverMetriquesDocument(doc, 1);
    expect(m.titre).toBeNull();
  });

  it("injecte le numéro global 1-based fourni par l'amont", () => {
    const doc = rendererTextuel("d1", "Titre", "<p>contenu</p>");
    const m = deriverMetriquesDocument(doc, 7);
    expect(m.numero).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// determinerSpan
// ---------------------------------------------------------------------------

describe("determinerSpan", () => {
  it("document textuel court (50 mots) → span 1", () => {
    expect(determinerSpan(docTextuel(1, 50))).toBe(1);
  });

  it("document textuel > 150 mots → span 2", () => {
    expect(determinerSpan(docTextuel(1, 151))).toBe(2);
  });

  it("document iconographique paysage (ratio < 1.3) → span 1", () => {
    expect(determinerSpan(docIconographique(1, 0.75))).toBe(1);
  });

  it("document iconographique portrait très vertical (ratio > 1.3) → span 2", () => {
    expect(determinerSpan(docIconographique(1, 1.5))).toBe(2);
  });

  it("document iconographique exactement au seuil (ratio = 1.3) → span 1", () => {
    // La règle est > 1.3 strict
    expect(determinerSpan(docIconographique(1, 1.3))).toBe(1);
  });

  it("structure perspectives → span 2 indépendamment du contenu", () => {
    const doc: DocumentAPositionner = {
      ...docTextuel(1, 30),
      structure: "perspectives",
    };
    expect(determinerSpan(doc)).toBe(2);
  });

  it("structure deux_temps → span 2 indépendamment du contenu", () => {
    const doc: DocumentAPositionner = {
      ...docIconographique(1, 0.5),
      structure: "deux_temps",
    };
    expect(determinerSpan(doc)).toBe(2);
  });

  it("titre long (13 mots) + contenu conséquent (90 mots) → span 2", () => {
    const titre = motsRepetes(13);
    expect(determinerSpan(docTextuel(1, 90, { titre }))).toBe(2);
  });

  it("titre long mais contenu court → reste span 1", () => {
    const titre = motsRepetes(13);
    expect(determinerSpan(docTextuel(1, 50, { titre }))).toBe(1);
  });

  it("titre court + contenu conséquent → reste span 1", () => {
    expect(determinerSpan(docTextuel(1, 90, { titre: "Titre court" }))).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// estimerHauteur — sanity checks (l'algorithme dépend de valeurs > 0 croissantes)
// ---------------------------------------------------------------------------

describe("estimerHauteur", () => {
  it("produit une hauteur strictement positive pour un document textuel minimal", () => {
    expect(estimerHauteur(docTextuel(1, 10), 1)).toBeGreaterThan(0);
  });

  it("un textuel long est plus haut qu'un textuel court, à span équivalent", () => {
    const court = estimerHauteur(docTextuel(1, 20), 1);
    const long = estimerHauteur(docTextuel(2, 120), 1);
    expect(long).toBeGreaterThan(court);
  });

  it("un textuel en span 2 est moins haut que le même en span 1 (plus de mots par ligne)", () => {
    const span1 = estimerHauteur(docTextuel(1, 120), 1);
    const span2 = estimerHauteur(docTextuel(1, 120), 2);
    expect(span2).toBeLessThan(span1);
  });

  it("un iconographique en span 2 est ~ égal ou plus grand qu'en span 1", () => {
    const span1 = estimerHauteur(docIconographique(1, 0.7), 1);
    const span2 = estimerHauteur(docIconographique(1, 0.7), 2);
    expect(span2).toBeGreaterThanOrEqual(span1);
  });

  it("un titre visible ajoute de la hauteur vs un document sans titre", () => {
    const avec = estimerHauteur(docTextuel(1, 50, { titre: "Titre" }), 1);
    const sans = estimerHauteur(docTextuel(1, 50, { titre: null }), 1);
    expect(avec).toBeGreaterThan(sans);
  });
});

// ---------------------------------------------------------------------------
// placerDocuments — layout
// ---------------------------------------------------------------------------

describe("placerDocuments", () => {
  it("liste vide → aucune page", () => {
    const r = placerDocuments([], OPT_LARGE);
    expect(r.pages).toHaveLength(0);
  });

  it("6 documents span 1 → 1 page de 3 rangées pleines", () => {
    const docs = Array.from({ length: 6 }, (_, i) => docTextuel(i + 1, 50));
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0].rangees).toHaveLength(3);
    expect(r.pages[0].rangees.every((rg) => rg.cellules.length === 2)).toBe(true);
    expect(r.pages[0].rangees.every((rg) => rg.cellules.every((c) => c.span === 1))).toBe(true);
  });

  it("7 documents span 1 → 2 pages (3 rangées pleines + 1 rangée partielle)", () => {
    const docs = Array.from({ length: 7 }, (_, i) => docTextuel(i + 1, 50));
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(2);
    expect(r.pages[0].rangees).toHaveLength(3);
    expect(r.pages[1].rangees).toHaveLength(1);
    expect(r.pages[1].rangees[0].cellules).toHaveLength(1);
    expect(r.pages[1].rangees[0].cellules[0].document.numero).toBe(7);
  });

  it("3 documents span 2 → 1 page de 3 rangées (max rangées atteint)", () => {
    const docs: DocumentAPositionner[] = [
      { ...docTextuel(1, 200), type: "textuel" },
      { ...docTextuel(2, 200), type: "textuel" },
      { ...docTextuel(3, 200), type: "textuel" },
    ];
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0].rangees).toHaveLength(3);
    expect(r.pages[0].rangees.every((rg) => rg.cellules.length === 1)).toBe(true);
    expect(r.pages[0].rangees.every((rg) => rg.cellules[0].span === 2)).toBe(true);
  });

  it("4 documents span 2 → 2 pages (3 rangées + 1 rangée)", () => {
    const docs = Array.from({ length: 4 }, (_, i) => docTextuel(i + 1, 200));
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(2);
    expect(r.pages[0].rangees).toHaveLength(3);
    expect(r.pages[1].rangees).toHaveLength(1);
  });

  it("1 span 2 puis 4 span 1 → 1 page (1 rangée pleine + 2 rangées span 1)", () => {
    const docs: DocumentAPositionner[] = [
      docTextuel(1, 200), // span 2
      docTextuel(2, 50), // span 1
      docTextuel(3, 50),
      docTextuel(4, 50),
      docTextuel(5, 50),
    ];
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0].rangees).toHaveLength(3);
    expect(r.pages[0].rangees[0].cellules[0].span).toBe(2);
    expect(r.pages[0].rangees[1].cellules).toHaveLength(2);
    expect(r.pages[0].rangees[2].cellules).toHaveLength(2);
  });

  it("span 1 puis span 2 → rangée partielle (cellule droite vide) puis nouvelle rangée pour le span 2", () => {
    const docs: DocumentAPositionner[] = [
      docTextuel(1, 50), // span 1
      docTextuel(2, 200), // span 2
    ];
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0].rangees).toHaveLength(2);
    // Rangée 1 : un seul span 1 (cellule droite vide implicite)
    expect(r.pages[0].rangees[0].cellules).toHaveLength(1);
    expect(r.pages[0].rangees[0].cellules[0].span).toBe(1);
    expect(r.pages[0].rangees[0].cellules[0].document.numero).toBe(1);
    // Rangée 2 : span 2
    expect(r.pages[0].rangees[1].cellules).toHaveLength(1);
    expect(r.pages[0].rangees[1].cellules[0].span).toBe(2);
    expect(r.pages[0].rangees[1].cellules[0].document.numero).toBe(2);
  });

  it("documents à perspectives et deux_temps sont forcés en span 2", () => {
    const docs: DocumentAPositionner[] = [
      { ...docTextuel(1, 10), structure: "perspectives" },
      { ...docTextuel(2, 10), structure: "deux_temps" },
    ];
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0].rangees).toHaveLength(2);
    expect(r.pages[0].rangees[0].cellules[0].span).toBe(2);
    expect(r.pages[0].rangees[1].cellules[0].span).toBe(2);
  });

  it("dépassement de hauteur utile → saut de page même si < 3 rangées", () => {
    // Hauteur utile minuscule pour forcer le saut dès la 2e rangée.
    const docs = Array.from({ length: 4 }, (_, i) => docTextuel(i + 1, 50));
    const r = placerDocuments(docs, { hauteurUtilePx: 200 });
    // Chaque rangée textuelle 50 mots span 1 fait ~187 px (25+90+44+18 + gap 10 = 187).
    // Deux rangées → ~374 px > 200 → saut obligé.
    expect(r.pages.length).toBeGreaterThanOrEqual(2);
    // La dernière rangée de la page 1 doit tenir dans 200 px.
    expect(r.pages[0].rangees).toHaveLength(1);
  });

  it("numéros préservés dans l'ordre de la liste source", () => {
    const docs = Array.from({ length: 5 }, (_, i) => docTextuel(i + 1, 50));
    const r = placerDocuments(docs, OPT_LARGE);
    const numerosObserves: number[] = [];
    for (const page of r.pages) {
      for (const rangee of page.rangees) {
        for (const cell of rangee.cellules) {
          numerosObserves.push(cell.document.numero);
        }
      }
    }
    expect(numerosObserves).toEqual([1, 2, 3, 4, 5]);
  });

  it("image portrait (ratio > 1.3) force le span 2", () => {
    const docs: DocumentAPositionner[] = [
      docIconographique(1, 1.6), // span 2 auto
      docIconographique(2, 0.7), // span 1
      docIconographique(3, 0.7), // span 1
    ];
    const r = placerDocuments(docs, OPT_LARGE);
    expect(r.pages).toHaveLength(1);
    expect(r.pages[0].rangees).toHaveLength(2);
    expect(r.pages[0].rangees[0].cellules[0].span).toBe(2);
    expect(r.pages[0].rangees[1].cellules).toHaveLength(2);
    expect(r.pages[0].rangees[1].cellules.every((c) => c.span === 1)).toBe(true);
  });
});
