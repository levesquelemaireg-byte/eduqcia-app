import { describe, expect, it } from "vitest";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { RendererDocument } from "@/lib/types/document-renderer";
import { MAX_CONTENT_HEIGHT_PX } from "@/lib/epreuve/pagination/constantes";
import { tacheVersImprimable } from "./tache-vers-imprimable";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function creerDoc(id: string): RendererDocument {
  return {
    id,
    titre: `Document ${id}`,
    structure: "simple",
    elements: [
      {
        id,
        type: "textuel",
        contenu: `<p>${id}</p>`,
        source: "",
        sourceType: "primaire",
        categorieTextuelle: "autre",
      },
    ],
  };
}

function creerTache(overrides?: Partial<DonneesTache>): DonneesTache {
  return {
    id: "t1",
    auteur_id: "u1",
    auteurs: [{ id: "u1", first_name: "A", last_name: "B" }],
    titre: "Tâche test",
    consigne: "<p>Consigne</p>",
    guidage: { content: "<p>Guidage</p>" },
    documents: [creerDoc("d1")],
    espaceProduction: { type: "lignes", nbLignes: 10 },
    outilEvaluation: { oi: "OI2", criteres: [] },
    corrige: "<p>Corrigé</p>",
    aspects_societe: [],
    nb_lignes: 10,
    niveau: { label: "2e sec" },
    discipline: { label: "HQC" },
    oi: { id: "OI2", titre: "Situer", icone: "psychology" },
    comportement: { id: "2.1", enonce: "Situer un fait" },
    cd: null,
    connaissances: [],
    version: 1,
    version_updated_at: null,
    is_published: false,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

function mesureurFixe(hauteur: number) {
  return () => hauteur;
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("tacheVersImprimable", () => {
  it("retourne un RenduImprimable ok=true avec les bonnes pages", () => {
    const tache = creerTache();
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", estCorrige: false },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    expect(rendu.pages.length).toBeGreaterThan(0);
    expect(rendu.contexte).toEqual({ type: "tache", mode: "formatif", estCorrige: false });
    expect(rendu.enTete).toBeNull();
  });

  it("pagine correctement sur plusieurs pages si nécessaire", () => {
    const tache = creerTache({
      documents: [creerDoc("d1"), creerDoc("d2"), creerDoc("d3"), creerDoc("d4")],
    });
    // 4 docs courts → 1 bloc dossier-page (groupés sur 1 page de grille).
    // Avec un quadruplet, 2 blocs × 600px = 1200px → 2 pages (904px max).
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", estCorrige: false },
      mesureurFixe(600),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    expect(rendu.pages.length).toBe(2);
  });

  it("retourne une erreur de débordement si un bloc est trop grand", () => {
    const tache = creerTache();
    const hauteur = MAX_CONTENT_HEIGHT_PX * 0.98;
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", estCorrige: false },
      mesureurFixe(hauteur),
    );
    expect(rendu.ok).toBe(false);
    if (rendu.ok) return;
    expect(rendu.erreur.kind).toBe("DEBORDEMENT_BLOC");
  });

  it("inclut le corrigé quand estCorrige=true", () => {
    const tache = creerTache();
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", estCorrige: true },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const blocs = rendu.pages.flatMap((p) => p.blocs);
    expect(blocs.some((b) => b.id.includes("corrige"))).toBe(true);
  });

  it("calcule une empreinte déterministe", () => {
    const tache = creerTache();
    const opts = { mode: "formatif" as const, estCorrige: false };
    const r1 = tacheVersImprimable(tache, opts, mesureurFixe(200));
    const r2 = tacheVersImprimable(tache, opts, mesureurFixe(200));
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).toBe(r2.empreinte);
  });

  it("produit des empreintes différentes pour des modes différents", () => {
    const tache = creerTache();
    const r1 = tacheVersImprimable(
      tache,
      { mode: "formatif", estCorrige: false },
      mesureurFixe(200),
    );
    const r2 = tacheVersImprimable(
      tache,
      { mode: "sommatif-standard", estCorrige: false },
      mesureurFixe(200),
    );
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).not.toBe(r2.empreinte);
  });
});
