import { describe, expect, it } from "vitest";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { RendererDocument } from "@/lib/types/document-renderer";
import { construireBlocsTache } from "./blocs-tache";
import type { ContenuDossierPage } from "./blocs-dossier-pages";

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
    documents: [creerDoc("d1"), creerDoc("d2")],
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

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("construireBlocsTache", () => {
  it("produit une page de dossier (groupant les documents) + un quadruplet en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: null });
    // 2 docs courts → 1 page de grille (1 bloc dossier-page) + 1 quadruplet = 2 blocs
    expect(blocs).toHaveLength(2);
    expect(blocs[0].kind).toBe("dossier-page");
    expect(blocs[1].kind).toBe("quadruplet");
  });

  it("masque les titres de documents en mode sommatif-standard", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "sommatif-standard", corrige: null });
    const contenu = blocs[0].content as ContenuDossierPage;
    expect(contenu.titresVisibles).toBe(false);
  });

  it("conserve les titres de documents en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: null });
    const contenu = blocs[0].content as ContenuDossierPage;
    expect(contenu.titresVisibles).toBe(true);
  });

  it("masque le guidage en mode sommatif-standard", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "sommatif-standard", corrige: null });
    const quadruplet = blocs[1].content as { guidage: unknown };
    expect(quadruplet.guidage).toBeNull();
  });

  it("conserve le guidage en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: null });
    const quadruplet = blocs[1].content as { guidage: { content: string } };
    expect(quadruplet.guidage.content).toContain("Guidage");
  });

  it("injecte le corrigé comme overlay (corrigeTexte) sur le quadruplet en mode simple", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: "simple" });
    // Phase 5 lot 3 : aucun bloc corrigé séparé — 1 dossier-page + 1 quadruplet.
    expect(blocs).toHaveLength(2);
    const quadruplet = blocs[1].content as { corrigeTexte: string | null };
    expect(quadruplet.corrigeTexte).toBe("<p>Corrigé</p>");
  });

  it("ajoute les blocs annexe en mode détaillé", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: "detaille" });
    // 1 dossier-page + 1 quadruplet + 1 titre annexe + 1 question annexe = 4
    expect(blocs).toHaveLength(4);
    expect(blocs[2].kind).toBe("annexe-corrige");
    expect(blocs[3].kind).toBe("annexe-corrige");
  });

  it("ne produit pas d'annexe si le corrigé est vide", () => {
    const tache = creerTache({ corrige: "" });
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: "detaille" });
    expect(blocs).toHaveLength(2);
    const quadruplet = blocs[1].content as { corrigeTexte: string | null };
    expect(quadruplet.corrigeTexte).toBeNull();
  });

  it("ne produit pas d'overlay corrigé si corrige=null", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: null });
    expect(blocs).toHaveLength(2);
    const quadruplet = blocs[1].content as { corrigeTexte: string | null };
    expect(quadruplet.corrigeTexte).toBeNull();
  });

  it("ne produit aucun bloc dossier-page si la tâche n'a pas de documents", () => {
    const tache = creerTache({ documents: [] });
    const blocs = construireBlocsTache(tache, { mode: "formatif", corrige: null });
    // 0 dossier-page + 1 quadruplet = 1
    expect(blocs).toHaveLength(1);
    expect(blocs[0].kind).toBe("quadruplet");
  });
});
