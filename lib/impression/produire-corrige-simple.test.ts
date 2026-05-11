/**
 * Tests pour produireCorrigeSimpleNR — chaque parcours est testé contre le
 * HTML réellement produit par son builder + le corrigé HTML correspondant.
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §3.5, §7.5.
 */

import { describe, expect, it } from "vitest";
import {
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueCorrigeHtml,
  initialOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsCorrigeHtml,
  type LigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  initialAvantApresPayload,
  type AvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  buildCarteHistoriqueConsigneHtml,
  buildCarteHistoriqueCorrigeHtml,
  initialCarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import {
  buildManifestationsConsigneHtml,
  buildManifestationsCorrigeHtml,
  initialManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import {
  buildCausesConsequencesConsigneHtml,
  buildCausesConsequencesCorrigeHtml,
  initialCausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import { extraireFragmentsNR } from "./extraire-fragments-nr";
import { produireCorrigeSimpleNR } from "./produire-corrige-simple";

const ROUGE = "#c0392b";

/* -------------------------------------------------------------------------- */
/*  Ordre chronologique                                                       */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — ordre chronologique", () => {
  const payload = {
    ...initialOrdreChronologiquePayload(),
    consigneTheme: "la Confédération",
    optionA: [1, 2, 3, 4] as const,
    optionB: [2, 1, 3, 4] as const,
    optionC: [4, 3, 2, 1] as const,
    optionD: [3, 1, 2, 4] as const,
    correctLetter: "B" as const,
    optionsJustification: "doc 2 puis 1 puis 3 puis 4",
  };
  const consigne = buildOrdreChronologiqueConsigneHtml(payload);
  const corrige = buildOrdreChronologiqueCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte la lettre B en rouge dans la case réponse", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.reponse).toContain(ROUGE);
    expect(out.reponse).toMatch(/ordre-chrono-eleve-reponse-box[^>]*>B</);
  });

  it("applique le rouge à l'option correcte (B) seulement", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    // L'option B doit contenir le style rouge.
    const matchB = out.corps.match(
      /<div class="ordre-chrono-eleve-option" style="[^"]*">[\s\S]*?B\)[\s\S]*?<\/div>/,
    );
    expect(matchB).not.toBeNull();
    expect(matchB![0]).toContain(ROUGE);
    // L'option A doit rester sans style.
    expect(out.corps).toMatch(/<div class="ordre-chrono-eleve-option">[\s\S]*?A\)/);
  });

  it("épaissit les bordures des digits de la bonne option", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.corps).toContain(`border: 2px solid ${ROUGE}`);
  });

  it("retourne les fragments inchangés si le corrigé est vide", () => {
    const out = produireCorrigeSimpleNR(fragments, "");
    expect(out).toEqual(fragments);
  });
});

/* -------------------------------------------------------------------------- */
/*  Ligne du temps                                                             */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — ligne du temps", () => {
  const payload: LigneDuTempsPayload = {
    variant: "ligne-du-temps-v1",
    segmentCount: 3,
    boundaries: [1500, 1700, 1850, 1950],
    correctLetter: "B",
  };
  const consigne = buildLigneDuTempsConsigneHtml(payload);
  const corrige = buildLigneDuTempsCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte la lettre B en rouge dans la case réponse", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.reponse).toContain(ROUGE);
    expect(out.reponse).toMatch(/ligne-temps-eleve-reponse-box[^>]*>B</);
  });

  it("ne modifie pas le corps (frise SVG)", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.corps).toBe(fragments.corps);
  });
});

/* -------------------------------------------------------------------------- */
/*  Avant-après                                                                */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — avant-après", () => {
  const payload: AvantApresPayload = {
    ...initialAvantApresPayload(),
    theme: "la Conquête",
    repere: "1763",
    anneeRepere: 1763,
    optionRows: [
      { letter: "A", avantSlots: ["doc_1", "doc_2"], apresSlots: ["doc_3", "doc_4"] },
      { letter: "B", avantSlots: ["doc_1", "doc_3"], apresSlots: ["doc_2", "doc_4"] },
      { letter: "C", avantSlots: ["doc_1", "doc_4"], apresSlots: ["doc_2", "doc_3"] },
      { letter: "D", avantSlots: ["doc_2", "doc_3"], apresSlots: ["doc_1", "doc_4"] },
    ],
    correctLetter: "C",
    justification: "doc 1 et 4 avant ; doc 2 et 3 après",
    generated: true,
  };
  const consigne = buildAvantApresConsigneHtml(payload);
  const corrige = buildAvantApresCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte la lettre en rouge dans la case réponse", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.reponse).toContain(ROUGE);
    expect(out.reponse).toMatch(/avant-apres-eleve-reponse-box[^>]*>C</);
  });

  it("épaissit les bordures des cellules de la rangée correcte", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.corps).toContain(`border: 2px solid ${ROUGE}`);
  });
});

/* -------------------------------------------------------------------------- */
/*  Carte historique 2.1                                                       */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — carte historique 2.1", () => {
  const payload = {
    ...initialCarteHistoriquePayload("2.1"),
    consigneElement1: "le Saint-Laurent",
    correctLetter: "C" as const,
  };
  const consigne = buildCarteHistoriqueConsigneHtml(payload);
  const corrige = buildCarteHistoriqueCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte la lettre C en rouge dans la case réponse séparée", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.reponse).toContain(ROUGE);
    expect(out.reponse).toMatch(/carte-historique-eleve-reponse-box[^>]*>C</);
  });
});

/* -------------------------------------------------------------------------- */
/*  Carte historique 2.3 — deux cases inline                                   */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — carte historique 2.3", () => {
  const payload = {
    ...initialCarteHistoriquePayload("2.3"),
    consigneElement1: "Mont Royal",
    consigneElement2: "Lac Saint-Jean",
    correctLetter1: "A" as const,
    correctLetter2: "B" as const,
  };
  const consigne = buildCarteHistoriqueConsigneHtml(payload);
  const corrige = buildCarteHistoriqueCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte A et B en rouge dans les cases inline du corps", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.reponse).toBeNull(); // pas de réponse séparée pour 2.3
    expect(out.corps).toContain(ROUGE);
    // Deux cases : la première reçoit A, la seconde reçoit B.
    const matches = [...out.corps.matchAll(/carte-historique-eleve-reponse-box[^>]*>([AB])</g)];
    expect(matches).toHaveLength(2);
    expect(matches[0]![1]).toBe("A");
    expect(matches[1]![1]).toBe("B");
  });
});

/* -------------------------------------------------------------------------- */
/*  Manifestations                                                             */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — manifestations 5.1 (2 cat × 1 case)", () => {
  const payload = {
    ...initialManifestationsPayload("5.1"),
    consigneSujet: "le commerce",
    categories: ["Économie", "Politique"],
    associations: [[1], [2]],
  };
  const consigne = buildManifestationsConsigneHtml(payload);
  const corrige = buildManifestationsCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte le numéro de document dans chaque case (ordre des catégories)", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    expect(out.reponse).toBeNull();
    expect(out.corps).toContain(ROUGE);
    // Premier <span class="manifestations-eleve-case"> de la 1re cellule = 1
    // Second <span class="manifestations-eleve-case"> de la 2e cellule = 2
    const matches = [
      ...out.corps.matchAll(/manifestations-eleve-case[^>]*style="[^"]+"[^>]*>(\d+)</g),
    ];
    expect(matches).toHaveLength(2);
    expect(matches[0]![1]).toBe("1");
    expect(matches[1]![1]).toBe("2");
  });
});

describe("produireCorrigeSimpleNR — manifestations 5.2 (2 cat × 2 cases)", () => {
  const payload = {
    ...initialManifestationsPayload("5.2"),
    consigneSujet: "la culture",
    organisationCategories: "2-categories" as const,
    categories: ["Économie", "Politique"],
    associations: [
      [1, 2],
      [3, 4],
    ],
  };
  const consigne = buildManifestationsConsigneHtml(payload);
  const corrige = buildManifestationsCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte deux numéros par cellule dans l'ordre", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    const matches = [
      ...out.corps.matchAll(/manifestations-eleve-case[^>]*style="[^"]+"[^>]*>(\d+)</g),
    ];
    expect(matches.map((m) => m[1])).toEqual(["1", "2", "3", "4"]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Causes-conséquences                                                        */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — causes-conséquences 4.3", () => {
  const payload = {
    ...initialCausesConsequencesPayload("4.3"),
    consigneSujet: "la Révolution tranquille",
    associations: [1, 2] as [number, number],
  };
  const consigne = buildCausesConsequencesConsigneHtml(payload);
  const corrige = buildCausesConsequencesCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("injecte 1 et 2 en rouge dans les cases empilées", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    const matches = [
      ...out.corps.matchAll(/causes-consequences-eleve-case[^>]*style="[^"]+"[^>]*>(\d+)</g),
    ];
    expect(matches.map((m) => m[1])).toEqual(["1", "2"]);
    expect(out.corps).toContain(ROUGE);
  });
});

describe("produireCorrigeSimpleNR — causes-conséquences 4.4", () => {
  const payload = {
    ...initialCausesConsequencesPayload("4.4"),
    consigneSujet: "la Crise d'Octobre",
    associations: [2, 1] as [number, number],
  };
  const consigne = buildCausesConsequencesConsigneHtml(payload);
  const corrige = buildCausesConsequencesCorrigeHtml(payload);
  const fragments = extraireFragmentsNR(consigne)!;

  it("respecte l'ordre Cause / Conséquence du corrigé", () => {
    const out = produireCorrigeSimpleNR(fragments, corrige);
    const matches = [
      ...out.corps.matchAll(/causes-consequences-eleve-case[^>]*style="[^"]+"[^>]*>(\d+)</g),
    ];
    expect(matches.map((m) => m[1])).toEqual(["2", "1"]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Robustesse                                                                 */
/* -------------------------------------------------------------------------- */

describe("produireCorrigeSimpleNR — robustesse", () => {
  it("retourne les fragments inchangés si parcours inconnu", () => {
    const fragments = {
      parcours: "inconnu",
      intro: "<p>x</p>",
      corps: "<div>y</div>",
      reponse: null,
    };
    const out = produireCorrigeSimpleNR(fragments, "<p>Réponse attendue : A.</p>");
    expect(out).toEqual(fragments);
  });

  it("retourne les fragments inchangés si corrigé non-parseable", () => {
    const payload = {
      ...initialOrdreChronologiquePayload(),
      consigneTheme: "test",
      correctLetter: "A" as const,
    };
    const consigne = buildOrdreChronologiqueConsigneHtml(payload);
    const fragments = extraireFragmentsNR(consigne)!;
    const out = produireCorrigeSimpleNR(fragments, "<p>HTML malformé sans lettre</p>");
    expect(out).toEqual(fragments);
  });
});
