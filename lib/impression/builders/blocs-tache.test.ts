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

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("construireBlocsTache", () => {
  it("produit une page de dossier (groupant les documents) + un quadruplet en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    // 2 docs courts → 1 page de grille (1 bloc dossier-page) + 1 quadruplet = 2 blocs
    expect(blocs).toHaveLength(2);
    expect(blocs[0].kind).toBe("dossier-page");
    expect(blocs[1].kind).toBe("quadruplet");
  });

  it("masque les titres de documents en mode sommatif-standard", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "sommatif-standard", estCorrige: false });
    const contenu = blocs[0].content as ContenuDossierPage;
    expect(contenu.titresVisibles).toBe(false);
  });

  it("conserve les titres de documents en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    const contenu = blocs[0].content as ContenuDossierPage;
    expect(contenu.titresVisibles).toBe(true);
  });

  it("masque le guidage en mode sommatif-standard", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "sommatif-standard", estCorrige: false });
    const quadruplet = blocs[1].content as { guidage: unknown };
    expect(quadruplet.guidage).toBeNull();
  });

  it("conserve le guidage en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    const quadruplet = blocs[1].content as { guidage: { content: string } };
    expect(quadruplet.guidage.content).toContain("Guidage");
  });

  it("ajoute un bloc corrigé quand estCorrige=true et corrigé non vide", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: true });
    // 1 dossier-page + 1 quadruplet + 1 corrigé = 3
    expect(blocs).toHaveLength(3);
    expect(blocs[2].id).toContain("corrige");
  });

  it("ne produit pas de corrigé si le corrigé est vide", () => {
    const tache = creerTache({ corrige: "" });
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: true });
    expect(blocs).toHaveLength(2);
  });

  it("ne produit pas de corrigé si estCorrige=false", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    expect(blocs).toHaveLength(2);
  });

  it("ne produit aucun bloc dossier-page si la tâche n'a pas de documents", () => {
    const tache = creerTache({ documents: [] });
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    // 0 dossier-page + 1 quadruplet = 1
    expect(blocs).toHaveLength(1);
    expect(blocs[0].kind).toBe("quadruplet");
  });
});
