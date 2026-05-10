/**
 * Tests d'extraction des fragments NR — chaque parcours est testé contre
 * le HTML réellement produit par son builder.
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §3.1, §12 Phase 1.
 */

import { describe, expect, it } from "vitest";
import {
  buildOrdreChronologiqueConsigneHtml,
  initialOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  buildLigneDuTempsConsigneHtml,
  type LigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  buildAvantApresConsigneHtml,
  initialAvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  buildCarteHistoriqueConsigneHtml,
  initialCarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import {
  buildManifestationsConsigneHtml,
  initialManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import {
  buildCausesConsequencesConsigneHtml,
  initialCausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import { detecterParcoursNR, extraireFragmentsNR } from "./extraire-fragments-nr";

/* -------------------------------------------------------------------------- */
/*  detecterParcoursNR                                                        */
/* -------------------------------------------------------------------------- */

describe("detecterParcoursNR", () => {
  it("retourne null pour une chaîne vide", () => {
    expect(detecterParcoursNR("")).toBeNull();
  });

  it("retourne null pour du HTML rédactionnel (TipTap)", () => {
    const html = "<p>Réponse attendue de l'élève en quelques lignes.</p>";
    expect(detecterParcoursNR(html)).toBeNull();
  });

  it("détecte ordre-chrono-eleve via l'attribut data", () => {
    const html = buildOrdreChronologiqueConsigneHtml({
      ...initialOrdreChronologiquePayload(),
      consigneTheme: "la Confédération",
    });
    expect(detecterParcoursNR(html)).toBe("ordre-chrono-eleve");
  });
});

/* -------------------------------------------------------------------------- */
/*  extraireFragmentsNR — null pour rédactionnel                              */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — non-NR", () => {
  it("retourne null pour une consigne rédactionnelle", () => {
    expect(extraireFragmentsNR("<p>Texte libre</p>")).toBeNull();
  });

  it("retourne null pour une chaîne vide", () => {
    expect(extraireFragmentsNR("")).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  Ordre chronologique — intro + grid + reponse séparée                      */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — ordre-chronologique", () => {
  const html = buildOrdreChronologiqueConsigneHtml({
    ...initialOrdreChronologiquePayload(),
    consigneTheme: "la Confédération canadienne",
  });

  it("découpe en intro + corps + reponse non-null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    expect(f!.parcours).toBe("ordre-chrono-eleve");
    expect(f!.intro).toContain('class="ordre-chrono-eleve-intro"');
    expect(f!.corps).toContain('class="ordre-chrono-eleve-grid"');
    expect(f!.reponse).not.toBeNull();
    expect(f!.reponse!).toContain('class="ordre-chrono-eleve-reponse"');
  });

  it("le corps contient la grille des 4 options A-D", () => {
    const f = extraireFragmentsNR(html)!;
    expect(f.corps).toContain("A)");
    expect(f.corps).toContain("D)");
  });

  it("l'intro ne contient pas la grille ni la zone réponse", () => {
    const f = extraireFragmentsNR(html)!;
    expect(f.intro).not.toContain("ordre-chrono-eleve-grid");
    expect(f.intro).not.toContain("ordre-chrono-eleve-reponse");
  });
});

/* -------------------------------------------------------------------------- */
/*  Ligne du temps — intro + frise + reponse séparée                          */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — ligne-du-temps", () => {
  const payload: LigneDuTempsPayload = {
    variant: "ligne-du-temps-v1",
    segmentCount: 3,
    boundaries: [1500, 1700, 1850, 1950],
    correctLetter: "B",
  };
  const html = buildLigneDuTempsConsigneHtml(payload);

  it("découpe en intro + corps (frise SVG) + reponse non-null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    expect(f!.intro).toContain('class="ligne-temps-eleve-intro"');
    expect(f!.corps).toContain('class="ligne-temps-frise"');
    expect(f!.corps).toContain("<svg");
    expect(f!.reponse).not.toBeNull();
    expect(f!.reponse!).toContain('class="ligne-temps-eleve-reponse"');
  });
});

/* -------------------------------------------------------------------------- */
/*  Avant-après — intro + table + reponse séparée                             */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — avant-apres", () => {
  const html = buildAvantApresConsigneHtml({
    ...initialAvantApresPayload(),
    theme: "la Conquête",
    repere: "1763",
    anneeRepere: 1763,
  });

  it("découpe en intro + corps (table) + reponse non-null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    expect(f!.intro).toContain('class="avant-apres-eleve-intro"');
    expect(f!.corps).toContain('<table class="avant-apres-eleve-table"');
    expect(f!.reponse).not.toBeNull();
    expect(f!.reponse!).toContain('class="avant-apres-eleve-reponse"');
  });
});

/* -------------------------------------------------------------------------- */
/*  Carte historique — 3 sous-modes (2.1 / 2.2 / 2.3)                         */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — carte-historique 2.1 (question simple)", () => {
  const html = buildCarteHistoriqueConsigneHtml({
    ...initialCarteHistoriquePayload("2.1"),
    consigneElement1: "le Saint-Laurent",
  });

  it("intro contient le texte fusionné intro + question (Phase 8b), corps vide, reponse non-null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    // Phase 8b correction 8 : intro + question fusionnées dans un seul <p>.
    expect(f!.intro).toContain('class="carte-historique-eleve-intro"');
    expect(f!.intro).toContain("le Saint-Laurent");
    expect(f!.corps).toBe("");
    expect(f!.reponse).not.toBeNull();
    expect(f!.reponse!).toContain('class="carte-historique-eleve-reponse"');
  });
});

describe("extraireFragmentsNR — carte-historique 2.2 (tableau)", () => {
  const html = buildCarteHistoriqueConsigneHtml({
    ...initialCarteHistoriquePayload("2.2"),
    consigneElement1: "Fleuve",
    consigneElement2: "Lac",
  });

  it("intro contient le texte fusionné, reponse non-null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    // Phase 8b correction 8 : intro + question fusionnées dans un seul <p>.
    expect(f!.intro).toContain('class="carte-historique-eleve-intro"');
    // Le builder n'émet la table que si generated22 est vrai — sinon corps reste vide.
    // On vérifie au moins que la reponse séparée est bien capturée.
    expect(f!.reponse).not.toBeNull();
    expect(f!.reponse!).toContain('class="carte-historique-eleve-reponse"');
  });
});

describe("extraireFragmentsNR — carte-historique 2.3 (liste avec cases inline)", () => {
  const html = buildCarteHistoriqueConsigneHtml({
    ...initialCarteHistoriquePayload("2.3"),
    consigneElement1: "Mont Royal",
    consigneElement2: "Lac Saint-Jean",
  });

  it("intro contient le texte fusionné, corps = ul (items), reponse = null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    // Phase 8b correction 8 : intro + lead question fusionnés dans un seul <p>.
    expect(f!.intro).toContain('class="carte-historique-eleve-intro"');
    expect(f!.corps).toContain('class="carte-historique-eleve-items"');
    // Les <span class="carte-historique-eleve-reponse"> sont inline dans <li>
    // → restriction <div> exclut → reponse = null (cases dans corps).
    expect(f!.reponse).toBeNull();
    // Vérification que les spans réponse sont bien dans le corps (pas perdus).
    expect(f!.corps).toContain('class="carte-historique-eleve-reponse"');
  });
});

/* -------------------------------------------------------------------------- */
/*  Manifestations — pas de reponse séparée (cases dans grille)               */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — manifestations", () => {
  const html = buildManifestationsConsigneHtml({
    ...initialManifestationsPayload("5.1"),
    consigneSujet: "le commerce",
    categories: ["Économie", "Politique"],
  });

  it("découpe en intro + corps (grille), reponse = null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    // Phase 8b correction 11 : intro + instruction fusionnées dans un seul <p>.
    expect(f!.intro).toContain('class="manifestations-eleve-intro"');
    expect(f!.corps).toContain('class="manifestations-eleve-grille"');
    expect(f!.reponse).toBeNull();
    expect(f!.corps).toContain('class="manifestations-eleve-case"');
  });
});

/* -------------------------------------------------------------------------- */
/*  Causes-conséquences — pas de reponse séparée                              */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — causes-consequences 4.3", () => {
  const html = buildCausesConsequencesConsigneHtml({
    ...initialCausesConsequencesPayload("4.3"),
    consigneSujet: "la Révolution tranquille",
  });

  it("intro mono-paragraphe + grille empilée, reponse = null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    expect(f!.intro).toContain('class="causes-consequences-eleve-intro"');
    expect(f!.corps).toContain('class="causes-consequences-eleve-grille"');
    expect(f!.reponse).toBeNull();
  });
});

describe("extraireFragmentsNR — causes-consequences 4.4 (avec liste à puces)", () => {
  const html = buildCausesConsequencesConsigneHtml({
    ...initialCausesConsequencesPayload("4.4"),
    consigneSujet: "la Crise d'Octobre",
  });

  it("intro contient intro + intro-list, corps = grille, reponse = null", () => {
    const f = extraireFragmentsNR(html);
    expect(f).not.toBeNull();
    expect(f!.intro).toContain('class="causes-consequences-eleve-intro"');
    expect(f!.intro).toContain('class="causes-consequences-eleve-intro-list"');
    expect(f!.corps).toContain('class="causes-consequences-eleve-grille"');
    expect(f!.reponse).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  Robustesse — pas de faux positifs sur les classes voisines                */
/* -------------------------------------------------------------------------- */

describe("extraireFragmentsNR — robustesse classes voisines", () => {
  it("ne confond pas `…-reponse` avec `…-reponse-label` ou `…-reponse-box`", () => {
    // Le wrapper reponse de ordre-chrono contient des spans -reponse-label/-box.
    // L'extracteur doit identifier le DIV reponse, pas les spans imbriqués.
    const html = buildOrdreChronologiqueConsigneHtml({
      ...initialOrdreChronologiquePayload(),
      consigneTheme: "test",
    });
    const f = extraireFragmentsNR(html)!;
    expect(f.reponse).not.toBeNull();
    // La reponse doit commencer par <div, pas par <span.
    expect(f.reponse!.startsWith("<div")).toBe(true);
    // Et contient bien les spans imbriqués.
    expect(f.reponse!).toContain("ordre-chrono-eleve-reponse-label");
    expect(f.reponse!).toContain("ordre-chrono-eleve-reponse-box");
  });
});
