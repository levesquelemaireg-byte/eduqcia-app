import { describe, expect, it } from "vitest";
import type { DonneesTache, DocumentReference } from "@/lib/tache/contrats/donnees";
import { construireBlocsTache } from "./blocs-tache";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function creerDoc(id: string): DocumentReference {
  return { id, kind: "textuel", titre: `Document ${id}`, contenu: `<p>${id}</p>` };
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
  it("produit un bloc document par document + un quadruplet en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    // 2 docs + 1 quadruplet = 3 blocs
    expect(blocs).toHaveLength(3);
    expect(blocs[0].kind).toBe("document");
    expect(blocs[1].kind).toBe("document");
    expect(blocs[2].kind).toBe("quadruplet");
  });

  it("masque les titres de documents en mode sommatif-standard", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "sommatif-standard", estCorrige: false });
    const contenu = blocs[0].content as { document: DocumentReference };
    expect(contenu.document.titre).toBe("");
  });

  it("conserve les titres de documents en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    const contenu = blocs[0].content as { document: DocumentReference };
    expect(contenu.document.titre).toBe("Document d1");
  });

  it("masque le guidage en mode sommatif-standard", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "sommatif-standard", estCorrige: false });
    const quadruplet = blocs[2].content as { guidage: unknown };
    expect(quadruplet.guidage).toBeNull();
  });

  it("conserve le guidage en mode formatif", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    const quadruplet = blocs[2].content as { guidage: { content: string } };
    expect(quadruplet.guidage.content).toContain("Guidage");
  });

  it("ajoute un bloc corrigé quand estCorrige=true et corrigé non vide", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: true });
    // 2 docs + 1 quadruplet + 1 corrigé = 4
    expect(blocs).toHaveLength(4);
    expect(blocs[3].id).toContain("corrige");
  });

  it("ne produit pas de corrigé si le corrigé est vide", () => {
    const tache = creerTache({ corrige: "" });
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: true });
    expect(blocs).toHaveLength(3);
  });

  it("ne produit pas de corrigé si estCorrige=false", () => {
    const tache = creerTache();
    const blocs = construireBlocsTache(tache, { mode: "formatif", estCorrige: false });
    expect(blocs).toHaveLength(3);
  });
});
