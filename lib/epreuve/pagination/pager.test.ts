import { describe, expect, it } from "vitest";
import { MAX_CONTENT_HEIGHT_PX, RATIO_MAX_BLOC } from "./constantes";
import type { Bloc, BlocMesure } from "./types";
import { mesurerBloc, verifierDebordement, paginer, type Mesureur } from "./pager";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

function creerBloc(id: string): Bloc {
  return { id, kind: "quadruplet", content: {} };
}

function creerBlocMesure(id: string, hauteurPx: number): BlocMesure {
  const ratio = hauteurPx / MAX_CONTENT_HEIGHT_PX;
  return {
    id,
    kind: "quadruplet",
    content: {},
    hauteurPx,
    ratio,
    securise: ratio <= RATIO_MAX_BLOC,
  };
}

function mesureurFixe(hauteur: number): Mesureur {
  return () => hauteur;
}

/* -------------------------------------------------------------------------- */
/*  mesurerBloc                                                               */
/* -------------------------------------------------------------------------- */

describe("mesurerBloc", () => {
  it("calcule le ratio et marque sécurisé si ≤ RATIO_MAX_BLOC", () => {
    const bloc = creerBloc("b1");
    const resultat = mesurerBloc(bloc, mesureurFixe(200));
    expect(resultat.hauteurPx).toBe(200);
    expect(resultat.ratio).toBeCloseTo(200 / MAX_CONTENT_HEIGHT_PX);
    expect(resultat.securise).toBe(true);
  });

  it("marque non sécurisé si ratio > RATIO_MAX_BLOC", () => {
    const hauteur = MAX_CONTENT_HEIGHT_PX * 0.98;
    const bloc = creerBloc("b1");
    const resultat = mesurerBloc(bloc, mesureurFixe(hauteur));
    expect(resultat.securise).toBe(false);
  });

  it("marque sécurisé si ratio est exactement RATIO_MAX_BLOC", () => {
    const hauteur = MAX_CONTENT_HEIGHT_PX * RATIO_MAX_BLOC;
    const bloc = creerBloc("b1");
    const resultat = mesurerBloc(bloc, mesureurFixe(hauteur));
    expect(resultat.securise).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  verifierDebordement                                                       */
/* -------------------------------------------------------------------------- */

describe("verifierDebordement", () => {
  it("retourne null si tous les blocs sont sécurisés", () => {
    const blocs = [creerBlocMesure("b1", 200), creerBlocMesure("b2", 300)];
    expect(verifierDebordement(blocs)).toBeNull();
  });

  it("retourne une erreur pour le premier bloc non sécurisé", () => {
    const blocs = [creerBlocMesure("b1", 200), creerBlocMesure("b2", MAX_CONTENT_HEIGHT_PX * 0.98)];
    const erreur = verifierDebordement(blocs);
    expect(erreur).not.toBeNull();
    expect(erreur!.blocId).toBe("b2");
    expect(erreur!.kind).toBe("DEBORDEMENT_BLOC");
  });

  it("retourne null pour une liste vide", () => {
    expect(verifierDebordement([])).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  paginer                                                                   */
/* -------------------------------------------------------------------------- */

describe("paginer", () => {
  it("place tous les blocs sur une seule page quand ils tiennent", () => {
    const blocs = [
      creerBlocMesure("b1", 200),
      creerBlocMesure("b2", 200),
      creerBlocMesure("b3", 200),
    ];
    const pages = paginer(blocs, "questionnaire");
    expect(pages).toHaveLength(1);
    expect(pages[0].blocs).toHaveLength(3);
    expect(pages[0].hauteurTotalePx).toBe(600);
  });

  it("répartit les blocs sur plusieurs pages", () => {
    // MAX_CONTENT_HEIGHT_PX = 904, chaque bloc = 300px → 3 par page (900px),
    // 5 blocs → 2 pages (3 + 2).
    const blocs = Array.from({ length: 5 }, (_, i) => creerBlocMesure(`b${i}`, 300));
    const pages = paginer(blocs, "questionnaire");
    expect(pages).toHaveLength(2);
    expect(pages[0].blocs).toHaveLength(3); // 900px
    expect(pages[1].blocs).toHaveLength(2); // 600px
  });

  it("numérote les pages correctement", () => {
    const blocs = Array.from({ length: 4 }, (_, i) => creerBlocMesure(`b${i}`, 500));
    const pages = paginer(blocs, "dossier-documentaire");
    // 500px chaque → 1 par page (825 max) → 4 pages
    expect(pages).toHaveLength(4);
    expect(pages[0].numeroPage).toBe(1);
    expect(pages[0].totalPages).toBe(4);
    expect(pages[1].numeroPage).toBe(2);
    expect(pages[3].numeroPage).toBe(4);
    expect(pages[3].totalPages).toBe(4);
  });

  it("détecte le débordement via verifierDebordement (ratio > RATIO_MAX_BLOC)", () => {
    const hauteurDebordante = MAX_CONTENT_HEIGHT_PX * 0.98;
    const blocs = [creerBlocMesure("b-overflow", hauteurDebordante)];
    const erreur = verifierDebordement(blocs);
    expect(erreur).not.toBeNull();
    expect(erreur!.blocId).toBe("b-overflow");
  });

  it("retourne un tableau vide si aucun bloc", () => {
    const pages = paginer([], "questionnaire");
    expect(pages).toHaveLength(0);
  });

  it("gère un seul bloc qui remplit exactement la page", () => {
    const blocs = [creerBlocMesure("b1", MAX_CONTENT_HEIGHT_PX)];
    const pages = paginer(blocs, "cahier-reponses");
    expect(pages).toHaveLength(1);
    expect(pages[0].blocs).toHaveLength(1);
    expect(pages[0].hauteurTotalePx).toBe(MAX_CONTENT_HEIGHT_PX);
    expect(pages[0].numeroPage).toBe(1);
    expect(pages[0].totalPages).toBe(1);
  });

  it("affecte le bon type de feuillet à chaque page", () => {
    const blocs = [creerBlocMesure("b1", 200)];
    const pages = paginer(blocs, "cahier-reponses");
    expect(pages[0].feuillet).toBe("cahier-reponses");
  });

  it("pousse un bloc sur une nouvelle page si l'ajout dépasse MAX_CONTENT_HEIGHT_PX", () => {
    // 2 blocs de 500px : le 2e ne tient pas sur la même page (500+500=1000 > 904)
    const blocs = [creerBlocMesure("b1", 500), creerBlocMesure("b2", 500)];
    const pages = paginer(blocs, "questionnaire");
    expect(pages).toHaveLength(2);
    expect(pages[0].blocs).toHaveLength(1);
    expect(pages[1].blocs).toHaveLength(1);
  });
});

/* -------------------------------------------------------------------------- */
/*  Mode exclusive-page                                                       */
/* -------------------------------------------------------------------------- */

function creerBlocExclusif(id: string, hauteurPx: number): BlocMesure {
  const ratio = hauteurPx / MAX_CONTENT_HEIGHT_PX;
  return {
    id,
    kind: "dossier-page",
    pagination: { mode: "exclusive-page" },
    content: {},
    hauteurPx,
    ratio,
    securise: ratio <= 1,
  };
}

describe("paginer — mode exclusive-page", () => {
  it("place un bloc exclusif seul sur sa page même si la page courante a de la place", () => {
    // 1 bloc flow de 200px + 1 bloc exclusif de 300px : le flow doit être seul
    // sur la page 1, l'exclusif seul sur la page 2, bien qu'ils tiendraient
    // ensemble (500 < 904).
    const blocs = [creerBlocMesure("flow-1", 200), creerBlocExclusif("dossier-1", 300)];
    const pages = paginer(blocs, "questionnaire");
    expect(pages).toHaveLength(2);
    expect(pages[0].blocs.map((b) => b.id)).toEqual(["flow-1"]);
    expect(pages[1].blocs.map((b) => b.id)).toEqual(["dossier-1"]);
  });

  it("referme immédiatement la page exclusive : les blocs flow suivants partent sur une nouvelle page", () => {
    const blocs = [creerBlocExclusif("dossier-1", 400), creerBlocMesure("flow-1", 200)];
    const pages = paginer(blocs, "questionnaire");
    expect(pages).toHaveLength(2);
    expect(pages[0].blocs.map((b) => b.id)).toEqual(["dossier-1"]);
    expect(pages[1].blocs.map((b) => b.id)).toEqual(["flow-1"]);
  });

  it("enchaîne plusieurs blocs exclusifs sur leurs propres pages respectives", () => {
    const blocs = [
      creerBlocExclusif("dossier-1", 400),
      creerBlocExclusif("dossier-2", 400),
      creerBlocExclusif("dossier-3", 400),
    ];
    const pages = paginer(blocs, "dossier-documentaire");
    expect(pages).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(pages[i].blocs).toHaveLength(1);
      expect(pages[i].blocs[0].id).toBe(`dossier-${i + 1}`);
    }
  });

  it("accepte un bloc exclusif jusqu'à MAX_CONTENT_HEIGHT_PX (ratio ≤ 1, pas ≤ 0.97)", () => {
    // Un bloc exclusif à 95% de MAX est sécurisé.
    const bloc: Bloc = {
      id: "dossier-1",
      kind: "dossier-page",
      pagination: { mode: "exclusive-page" },
      content: {},
    };
    const r = mesurerBloc(bloc, mesureurFixe(MAX_CONTENT_HEIGHT_PX * 0.98));
    expect(r.securise).toBe(true);

    // Un bloc flow à 98% de MAX ne l'est pas (seuil = 0.97).
    const blocFlow: Bloc = { id: "flow-1", kind: "quadruplet", content: {} };
    const rFlow = mesurerBloc(blocFlow, mesureurFixe(MAX_CONTENT_HEIGHT_PX * 0.98));
    expect(rFlow.securise).toBe(false);
  });
});
