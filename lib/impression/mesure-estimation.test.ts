import { describe, expect, it } from "vitest";
import type { Bloc } from "@/lib/epreuve/pagination/types";
import { mesurerBlocImpression } from "@/lib/impression/mesure-estimation";

function creerBlocDocument(contenu: unknown): Bloc {
  return {
    id: "doc-1",
    kind: "document",
    content: contenu,
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
  it("estime un document iconographique significativement au-dessus du fallback", () => {
    const bloc = creerBlocDocument({
      document: {
        id: "d1",
        titre: "Carte de la Nouvelle-France",
        structure: "simple",
        elements: [
          {
            id: "e1",
            type: "iconographique",
            imageUrl: "https://example.com/carte.jpg",
            imagePixelWidth: 1200,
            imagePixelHeight: 800,
            legende: "Carte politique et hydrographique annotée.",
            categorieIconographique: "carte",
            source: "<p>Archives nationales</p>",
            sourceType: "primaire",
          },
        ],
      },
      numeroGlobal: 1,
    });

    const h = mesurerBlocImpression(bloc);
    expect(h).toBeGreaterThan(300);
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
