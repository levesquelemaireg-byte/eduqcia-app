import { describe, expect, it } from "vitest";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { RendererDocument } from "@/lib/types/document-renderer";
import type { ContenuBlocQuadruplet } from "@/lib/impression/builders/blocs-quadruplet";
import type { ContenuAnnexeCorrige } from "@/components/epreuve/impression/sections/annexe-corrige";
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
    outilEvaluation: null,
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
      { mode: "formatif", corrige: null },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    expect(rendu.pages.length).toBeGreaterThan(0);
    expect(rendu.contexte).toEqual({ type: "tache", mode: "formatif", corrige: null });
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
      { mode: "formatif", corrige: null },
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
      { mode: "formatif", corrige: null },
      mesureurFixe(hauteur),
    );
    expect(rendu.ok).toBe(false);
    if (rendu.ok) return;
    expect(rendu.erreur.kind).toBe("DEBORDEMENT_BLOC");
  });

  it("injecte le corrigé simple comme overlay sur le quadruplet (rédactionnel → corrigeTexte)", () => {
    const tache = creerTache();
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: "simple" },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const quadruplet = rendu.pages.flatMap((p) => p.blocs).find((b) => b.kind === "quadruplet");
    const contenu = quadruplet!.content as ContenuBlocQuadruplet;
    expect(contenu.corrigeTexte).toBe("<p>Corrigé</p>");
    // Aucun bloc corrigé séparé (Phase 5 lot 3).
    const blocs = rendu.pages.flatMap((p) => p.blocs);
    expect(blocs.some((b) => b.id.startsWith("corrige-"))).toBe(false);
  });

  it("ajoute les blocs annexe (titre + question) en mode détaillé", () => {
    const tache = creerTache();
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: "detaille" },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const annexeBlocs = rendu.pages
      .flatMap((p) => p.blocs)
      .filter((b) => b.kind === "annexe-corrige");
    expect(annexeBlocs).toHaveLength(2);
    const titre = annexeBlocs[0]!.content as ContenuAnnexeCorrige;
    const question = annexeBlocs[1]!.content as ContenuAnnexeCorrige;
    expect(titre.type).toBe("titre");
    expect(question.type).toBe("question");
  });

  it("calcule une empreinte déterministe", () => {
    const tache = creerTache();
    const opts = { mode: "formatif" as const, corrige: null };
    const r1 = tacheVersImprimable(tache, opts, mesureurFixe(200));
    const r2 = tacheVersImprimable(tache, opts, mesureurFixe(200));
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).toBe(r2.empreinte);
  });

  it("produit des empreintes différentes pour des modes différents", () => {
    const tache = creerTache();
    const r1 = tacheVersImprimable(tache, { mode: "formatif", corrige: null }, mesureurFixe(200));
    const r2 = tacheVersImprimable(
      tache,
      { mode: "sommatif-standard", corrige: null },
      mesureurFixe(200),
    );
    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).not.toBe(r2.empreinte);
  });

  /* ------------------------------------------------------------------------ */
  /*  Résolution des placeholders {{doc_X}} (Bug 1 — spec §12 Phase 2)        */
  /* ------------------------------------------------------------------------ */

  it("résout les placeholders {{doc_N}} dans la consigne (numérotation locale)", () => {
    const tache = creerTache({
      consigne: "<p>Voir le document {{doc_1}} et le document {{doc_2}}.</p>",
      documents: [creerDoc("d1"), creerDoc("d2")],
    });
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: null },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const quadruplet = rendu.pages
      .flatMap((p) => p.blocs)
      .find((b) => b.id.startsWith("quadruplet-"));
    expect(quadruplet).toBeDefined();
    const contenu = quadruplet!.content as ContenuBlocQuadruplet;
    expect(contenu.consigne).toBe("<p>Voir le document 1 et le document 2.</p>");
    expect(contenu.consigne).not.toContain("{{doc_");
  });

  it("résout les placeholders {{doc_N}} dans le guidage", () => {
    const tache = creerTache({
      guidage: { content: "<p>Compare {{doc_1}} avec {{doc_2}}.</p>" },
      documents: [creerDoc("d1"), creerDoc("d2")],
    });
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: null },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const quadruplet = rendu.pages
      .flatMap((p) => p.blocs)
      .find((b) => b.id.startsWith("quadruplet-"));
    expect(quadruplet).toBeDefined();
    const contenu = quadruplet!.content as ContenuBlocQuadruplet;
    expect(contenu.guidage).not.toBeNull();
    expect(contenu.guidage!.content).toBe("<p>Compare 1 avec 2.</p>");
  });

  it("résout les placeholders {{doc_N}} dans le corrigé (overlay corrigeTexte)", () => {
    const tache = creerTache({
      corrige: "<p>Réponse appuyée sur le document {{doc_1}}.</p>",
      documents: [creerDoc("d1")],
    });
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: "simple" },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const quadruplet = rendu.pages.flatMap((p) => p.blocs).find((b) => b.kind === "quadruplet");
    const contenu = quadruplet!.content as ContenuBlocQuadruplet;
    expect(contenu.corrigeTexte).toBe("<p>Réponse appuyée sur le document 1.</p>");
    expect(contenu.corrigeTexte).not.toContain("{{doc_");
  });

  it("résout les placeholders {{doc_A}} legacy (alphabétique) dans la consigne", () => {
    const tache = creerTache({
      consigne: "<p>Voir le document {{doc_A}}.</p>",
      documents: [creerDoc("d1")],
    });
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: null },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const quadruplet = rendu.pages
      .flatMap((p) => p.blocs)
      .find((b) => b.id.startsWith("quadruplet-"));
    const contenu = quadruplet!.content as ContenuBlocQuadruplet;
    expect(contenu.consigne).toBe("<p>Voir le document 1.</p>");
  });

  it("ne change pas la consigne si elle ne contient pas de placeholders", () => {
    const tache = creerTache({
      consigne: "<p>Consigne sans référence document.</p>",
    });
    const rendu = tacheVersImprimable(
      tache,
      { mode: "formatif", corrige: null },
      mesureurFixe(200),
    );
    expect(rendu.ok).toBe(true);
    if (!rendu.ok) return;
    const quadruplet = rendu.pages
      .flatMap((p) => p.blocs)
      .find((b) => b.id.startsWith("quadruplet-"));
    const contenu = quadruplet!.content as ContenuBlocQuadruplet;
    expect(contenu.consigne).toBe("<p>Consigne sans référence document.</p>");
  });
});
