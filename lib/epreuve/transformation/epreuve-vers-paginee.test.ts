import { describe, expect, it } from "vitest";
import type { DonneesTache, DocumentReference } from "@/lib/tache/contrats/donnees";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import { MAX_CONTENT_HEIGHT_PX } from "@/lib/epreuve/pagination/constantes";
import { epreuveVersPaginee, type Mesureur, type OptionsRendu } from "./epreuve-vers-paginee";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function creerDoc(id: string, titre: string): DocumentReference {
  return { id, kind: "textuel", titre, contenu: `<p>${titre}</p>` };
}

function creerTache(overrides: Partial<DonneesTache> & { id: string }): DonneesTache {
  return {
    auteur_id: "user-1",
    auteurs: [{ id: "user-1", first_name: "Jean", last_name: "Dupont" }],
    titre: `Tâche ${overrides.id}`,
    consigne: "<p>Consigne</p>",
    guidage: { content: "<p>Guidage complémentaire</p>" },
    documents: [creerDoc(`doc-${overrides.id}-A`, "Document A")],
    espaceProduction: { type: "lignes", nbLignes: 10 },
    outilEvaluation: { oi: "OI2", criteres: [] },
    corrige: "<p>Corrigé</p>",
    aspects_societe: [],
    nb_lignes: 10,
    niveau: { label: "2e secondaire" },
    discipline: { label: "Histoire du Québec et du Canada" },
    oi: { id: "OI2", titre: "Situer dans le temps et dans l'espace", icone: "psychology" },
    comportement: { id: "2.1", enonce: "Situer un fait" },
    cd: null,
    connaissances: [],
    version: 1,
    version_updated_at: null,
    is_published: true,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

function creerEpreuve(taches: DonneesTache[]): DonneesEpreuve {
  return {
    id: "epreuve-1",
    titre: "Épreuve test",
    enTete: {
      titre: "Épreuve de fin d'étape",
      enseignant: "M. Dupont",
      ecole: "École secondaire",
      niveau: "2e secondaire",
    },
    taches,
  };
}

/** Mesureur mocké : retourne une hauteur fixe par bloc. */
function mesureurFixe(hauteur: number): Mesureur {
  return () => hauteur;
}

/* -------------------------------------------------------------------------- */
/*  Mode formatif                                                             */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — mode formatif", () => {
  const tache1 = creerTache({ id: "t1" });
  const tache2 = creerTache({
    id: "t2",
    documents: [creerDoc("doc-t2-A", "Document A t2"), creerDoc("doc-t2-B", "Document B t2")],
  });
  const epreuve = creerEpreuve([tache1, tache2]);
  const options: OptionsRendu = { mode: "formatif", estCorrige: false };

  it("ne produit pas de dossier documentaire en formatif", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    expect(resultat.feuillets["dossier-documentaire"]).toHaveLength(0);
  });

  it("ne produit pas de cahier de réponses en formatif", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    expect(resultat.feuillets["cahier-reponses"]).toHaveLength(0);
  });

  it("produit un questionnaire avec un quadruplet par tâche", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const pages = resultat.feuillets["questionnaire"];
    const blocs = pages.flatMap((p) => p.blocs);
    expect(blocs.filter((b) => b.kind === "quadruplet")).toHaveLength(2);
  });

  it("conserve le guidage dans les quadruplets en formatif", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["questionnaire"].flatMap((p) => p.blocs);
    const contenu = blocs[0].content as { guidage: { content: string } | null };
    expect(contenu.guidage).not.toBeNull();
    expect(contenu.guidage?.content).toContain("Guidage");
  });

  it("retourne l'en-tête de l'épreuve", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    expect(resultat.enTete.titre).toBe("Épreuve de fin d'étape");
  });

  it("calcule une empreinte non vide", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    expect(resultat.empreinte).toBeTruthy();
    expect(resultat.empreinte.length).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  Mode sommatif-standard                                                    */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — mode sommatif-standard", () => {
  const tache1 = creerTache({
    id: "t1",
    consigne: "<p>Voir {{doc_A}}</p>",
    documents: [creerDoc("doc-t1-A", "Proclamation royale")],
  });
  const tache2 = creerTache({
    id: "t2",
    documents: [creerDoc("doc-t2-A", "Acte de Québec"), creerDoc("doc-t2-B", "Constitution")],
  });
  const epreuve = creerEpreuve([tache1, tache2]);
  const options: OptionsRendu = { mode: "sommatif-standard", estCorrige: false };

  it("produit un dossier documentaire avec tous les documents numérotés", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const pages = resultat.feuillets["dossier-documentaire"];
    const blocs = pages.flatMap((p) => p.blocs);
    expect(blocs).toHaveLength(3);
    expect(blocs[0].kind).toBe("document");
  });

  it("masque les titres de documents en sommatif", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["dossier-documentaire"].flatMap((p) => p.blocs);
    const contenu = blocs[0].content as { document: DocumentReference };
    expect(contenu.document.titre).toBe("");
  });

  it("masque le guidage dans les quadruplets en sommatif", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["questionnaire"].flatMap((p) => p.blocs);
    const contenu = blocs[0].content as { guidage: { content: string } | null };
    expect(contenu.guidage).toBeNull();
  });

  it("résout {{doc_A}} dans la consigne avec le numéro global", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["questionnaire"].flatMap((p) => p.blocs);
    const contenu = blocs[0].content as { consigne: string };
    // doc-t1-A est le 1er document global
    expect(contenu.consigne).toBe("<p>Voir 1</p>");
  });

  it("ne produit pas de cahier de réponses en sommatif-standard", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    expect(resultat.feuillets["cahier-reponses"]).toHaveLength(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  Mode épreuve-ministérielle                                                */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — mode épreuve-ministérielle", () => {
  const tache = creerTache({ id: "t1" });
  const epreuve = creerEpreuve([tache]);
  const options: OptionsRendu = { mode: "epreuve-ministerielle", estCorrige: false };

  it("produit les 3 feuillets", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    expect(resultat.feuillets["dossier-documentaire"].length).toBeGreaterThan(0);
    expect(resultat.feuillets["questionnaire"].length).toBeGreaterThan(0);
    expect(resultat.feuillets["cahier-reponses"].length).toBeGreaterThan(0);
  });

  it("le cahier de réponses contient un bloc par tâche", () => {
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["cahier-reponses"].flatMap((p) => p.blocs);
    expect(blocs).toHaveLength(1);
    expect(blocs[0].tacheId).toBe("t1");
  });
});

/* -------------------------------------------------------------------------- */
/*  Flag estCorrige                                                           */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — flag estCorrige", () => {
  const tache = creerTache({ id: "t1", corrige: "<p>Réponse attendue</p>" });
  const epreuve = creerEpreuve([tache]);

  it("ajoute un bloc corrigé après le quadruplet quand estCorrige=true", () => {
    const options: OptionsRendu = { mode: "formatif", estCorrige: true };
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["questionnaire"].flatMap((p) => p.blocs);
    // quadruplet + corrigé
    expect(blocs).toHaveLength(2);
    expect(blocs[1].id).toContain("corrige");
  });

  it("n'ajoute pas de bloc corrigé quand estCorrige=false", () => {
    const options: OptionsRendu = { mode: "formatif", estCorrige: false };
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["questionnaire"].flatMap((p) => p.blocs);
    expect(blocs).toHaveLength(1);
  });

  it("n'ajoute pas de bloc corrigé si le corrigé est vide", () => {
    const tacheSansCorrige = creerTache({ id: "t2", corrige: "" });
    const ep = creerEpreuve([tacheSansCorrige]);
    const options: OptionsRendu = { mode: "formatif", estCorrige: true };
    const resultat = epreuveVersPaginee(ep, options, mesureurFixe(200));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const blocs = resultat.feuillets["questionnaire"].flatMap((p) => p.blocs);
    expect(blocs).toHaveLength(1);
  });
});

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — pagination", () => {
  it("crée plusieurs pages quand les blocs ne tiennent pas sur une seule", () => {
    const taches = Array.from({ length: 5 }, (_, i) => creerTache({ id: `t${i}` }));
    const epreuve = creerEpreuve(taches);
    const options: OptionsRendu = { mode: "formatif", estCorrige: false };
    // Chaque bloc = 300px, max = 825px → 2 blocs par page, 5 blocs → 3 pages
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(300));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const pages = resultat.feuillets["questionnaire"];
    expect(pages.length).toBe(3);
  });

  it("numérote les pages correctement", () => {
    const taches = Array.from({ length: 4 }, (_, i) => creerTache({ id: `t${i}` }));
    const epreuve = creerEpreuve(taches);
    const options: OptionsRendu = { mode: "formatif", estCorrige: false };
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(500));
    expect(resultat.ok).toBe(true);
    if (!resultat.ok) return;
    const pages = resultat.feuillets["questionnaire"];
    // 500px chaque → max 1 par page (825px) → 4 pages
    expect(pages).toHaveLength(4);
    expect(pages[0].numeroPage).toBe(1);
    expect(pages[0].totalPages).toBe(4);
    expect(pages[3].numeroPage).toBe(4);
    expect(pages[3].totalPages).toBe(4);
  });
});

/* -------------------------------------------------------------------------- */
/*  Détection de débordement                                                  */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — détection de débordement", () => {
  it("retourne une erreur si un bloc dépasse le ratio maximum", () => {
    const tache = creerTache({ id: "t1" });
    const epreuve = creerEpreuve([tache]);
    const options: OptionsRendu = { mode: "formatif", estCorrige: false };
    // Hauteur = 97.1% de MAX → ratio > 0.97
    const hauteurDebordante = MAX_CONTENT_HEIGHT_PX * 0.971;
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(hauteurDebordante));
    expect(resultat.ok).toBe(false);
    if (resultat.ok) return;
    expect(resultat.erreur.kind).toBe("DEBORDEMENT_BLOC");
    expect(resultat.erreur.hauteurPx).toBeCloseTo(hauteurDebordante);
  });

  it("passe si le bloc est exactement au ratio maximum", () => {
    const tache = creerTache({ id: "t1" });
    const epreuve = creerEpreuve([tache]);
    const options: OptionsRendu = { mode: "formatif", estCorrige: false };
    const hauteurLimite = MAX_CONTENT_HEIGHT_PX * 0.97;
    const resultat = epreuveVersPaginee(epreuve, options, mesureurFixe(hauteurLimite));
    expect(resultat.ok).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Empreinte                                                                 */
/* -------------------------------------------------------------------------- */

describe("epreuveVersPaginee — empreinte", () => {
  it("produit des empreintes différentes pour des options différentes", () => {
    const tache = creerTache({ id: "t1" });
    const epreuve = creerEpreuve([tache]);
    const mesureur = mesureurFixe(200);

    const r1 = epreuveVersPaginee(epreuve, { mode: "formatif", estCorrige: false }, mesureur);
    const r2 = epreuveVersPaginee(
      epreuve,
      { mode: "sommatif-standard", estCorrige: false },
      mesureur,
    );

    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).not.toBe(r2.empreinte);
  });

  it("produit la même empreinte pour les mêmes inputs", () => {
    const tache = creerTache({ id: "t1" });
    const epreuve = creerEpreuve([tache]);
    const options: OptionsRendu = { mode: "formatif", estCorrige: false };
    const mesureur = mesureurFixe(200);

    const r1 = epreuveVersPaginee(epreuve, options, mesureur);
    const r2 = epreuveVersPaginee(epreuve, options, mesureur);

    expect(r1.ok && r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.empreinte).toBe(r2.empreinte);
  });
});
