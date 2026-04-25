import { describe, expect, it } from "vitest";
import type { Bloc } from "@/lib/epreuve/pagination/types";
import { mesurerBlocImpression } from "@/lib/impression/mesure-estimation";
import type { DocumentAPositionner } from "@/lib/impression/layout-dossier-documentaire";

function docTextuel(numero: number, nombreMots: number): DocumentAPositionner {
  return {
    id: `d${numero}`,
    numero,
    type: "textuel",
    structure: "simple",
    titre: "Titre",
    nombreMots,
    imageRatio: null,
  };
}

function creerBlocDossierPage(
  content: unknown = {
    page: { rangees: [] },
    sources: new Map(),
    titresVisibles: true,
  },
): Bloc {
  return {
    id: "dossier-1",
    kind: "dossier-page",
    pagination: { mode: "exclusive-page" },
    content,
  };
}

function creerBlocQuadruplet(contenu: unknown): Bloc {
  return {
    id: "quad-1",
    kind: "quadruplet",
    content: contenu,
  };
}

describe("mesurerBlocImpression", () => {
  it("retourne 0 pour une page dossier vide (aucune rangée)", () => {
    expect(mesurerBlocImpression(creerBlocDossierPage())).toBe(0);
  });

  it("calcule la vraie hauteur d'un bloc dossier-page à partir des rangées", () => {
    const bloc = creerBlocDossierPage({
      page: {
        rangees: [
          { cellules: [{ document: docTextuel(1, 50), span: 1 }] },
          { cellules: [{ document: docTextuel(2, 50), span: 1 }] },
        ],
      },
      sources: new Map(),
      titresVisibles: true,
    });
    const h = mesurerBlocImpression(bloc);
    // Deux rangées + un gap : hauteur > 0, et croissante avec le nombre de rangées.
    expect(h).toBeGreaterThan(0);

    const blocUneRangee = creerBlocDossierPage({
      page: { rangees: [{ cellules: [{ document: docTextuel(1, 50), span: 1 }] }] },
      sources: new Map(),
      titresVisibles: true,
    });
    expect(h).toBeGreaterThan(mesurerBlocImpression(blocUneRangee));
  });

  it("augmente la hauteur quand la consigne est longue", () => {
    const blocCourt = creerBlocQuadruplet({
      titre: "Question 1",
      consigne: "<p>Expliquez brièvement.</p>",
      guidage: null,
      espaceProduction: { type: "lignes", nbLignes: 3 },
      outilEvaluation: { oi: "OI1", criteres: [] },
    });

    const blocLong = creerBlocQuadruplet({
      titre: "Question 1",
      consigne: `<p>${"Analysez le phénomène historique en mobilisant les sources. ".repeat(40)}</p>`,
      guidage: { content: "<p>Appuyez votre réponse sur deux documents.</p>" },
      espaceProduction: { type: "lignes", nbLignes: 3 },
      outilEvaluation: { oi: "OI1", criteres: [] },
    });

    const court = mesurerBlocImpression(blocCourt);
    const long = mesurerBlocImpression(blocLong);

    expect(long).toBeGreaterThan(court);
  });

  it("prend en compte le nombre de lignes de l'espace de production", () => {
    const blocPeuLignes = creerBlocQuadruplet({
      titre: "Question 2",
      consigne: "<p>Répondez.</p>",
      guidage: null,
      espaceProduction: { type: "lignes", nbLignes: 2 },
      outilEvaluation: { oi: "OI1", criteres: [] },
    });

    const blocPlusLignes = creerBlocQuadruplet({
      titre: "Question 2",
      consigne: "<p>Répondez.</p>",
      guidage: null,
      espaceProduction: { type: "lignes", nbLignes: 15 },
      outilEvaluation: { oi: "OI1", criteres: [] },
    });

    expect(mesurerBlocImpression(blocPlusLignes)).toBeGreaterThan(
      mesurerBlocImpression(blocPeuLignes),
    );
  });

  it("retourne une estimation minimale robuste pour un bloc non reconnu", () => {
    const bloc = creerBlocQuadruplet({ foo: "bar" });
    expect(mesurerBlocImpression(bloc)).toBeGreaterThanOrEqual(120);
  });
});
