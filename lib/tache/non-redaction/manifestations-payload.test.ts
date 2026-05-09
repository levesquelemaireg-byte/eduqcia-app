import { describe, expect, it } from "vitest";
import {
  buildManifestationsConsigneHtml,
  buildManifestationsCorrigeHtml,
  initialManifestationsPayload,
  isManifestationsComportementId,
  isManifestationsDocumentsStepComplete,
  isManifestationsStep3Complete,
  isManifestationsStep5Complete,
  manifestationsPayloadZodSchema,
  mergeManifestationsPayload,
  normalizeManifestationsPayload,
  type ManifestationsPayload,
} from "./manifestations-payload";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";

/* -------------------------------------------------------------------------- */
/*  Helpers de fixtures                                                        */
/* -------------------------------------------------------------------------- */

function payload51Complete(): ManifestationsPayload {
  return {
    schemaVersion: 1,
    comportementId: "5.1",
    consigneSujet: "la tradition orale et la prise de décision chez les Premiers Peuples",
    organisationCategories: "2-categories",
    categories: ["Tradition orale", "Partage des biens"],
    associations: [[1], [2]],
  };
}

function payload52_2catComplete(): ManifestationsPayload {
  return {
    schemaVersion: 1,
    comportementId: "5.2",
    consigneSujet: "aux droits et aux devoirs des censitaires",
    organisationCategories: "2-categories",
    categories: ["Droits", "Devoirs"],
    associations: [
      [1, 3],
      [2, 4],
    ],
  };
}

function payload52_4catComplete(): ManifestationsPayload {
  return {
    schemaVersion: 1,
    comportementId: "5.2",
    consigneSujet: "à l'organisation politique de la Nouvelle-France",
    organisationCategories: "4-categories",
    categories: ["Gouverneur", "Intendant", "Conseil souverain", "Capitaine de milice"],
    associations: [[1], [2], [3], [4]],
  };
}

function completeSlot(_slotId: DocumentSlotId): DocumentSlotData {
  return {
    ...emptyDocumentSlot(),
    mode: "create",
    type: "textuel",
    titre: "Doc",
    contenu: "<p>Contenu valide.</p>",
    source_citation: "<p>Archives nationales.</p>",
    source_type: "primaire",
    categorie_textuelle: "documents_officiels",
  };
}

/* -------------------------------------------------------------------------- */
/*  isManifestationsComportementId + Zod                                       */
/* -------------------------------------------------------------------------- */

describe("manifestations-payload — type guards", () => {
  it("isManifestationsComportementId valide 5.1 et 5.2", () => {
    expect(isManifestationsComportementId("5.1")).toBe(true);
    expect(isManifestationsComportementId("5.2")).toBe(true);
    expect(isManifestationsComportementId("5.3")).toBe(false);
    expect(isManifestationsComportementId("4.1")).toBe(false);
    expect(isManifestationsComportementId(null)).toBe(false);
  });

  it("Zod schema accepte un payload 5.1 valide", () => {
    const r = manifestationsPayloadZodSchema.safeParse(payload51Complete());
    expect(r.success).toBe(true);
  });

  it("Zod schema rejette un comportementId invalide", () => {
    const r = manifestationsPayloadZodSchema.safeParse({
      ...payload51Complete(),
      comportementId: "5.3",
    });
    expect(r.success).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  initialManifestationsPayload + mergeManifestationsPayload                  */
/* -------------------------------------------------------------------------- */

describe("manifestations-payload — initial / merge", () => {
  it("initial 5.1 → 2 catégories vides, organisation 2-categories", () => {
    const p = initialManifestationsPayload("5.1");
    expect(p.comportementId).toBe("5.1");
    expect(p.organisationCategories).toBe("2-categories");
    expect(p.categories).toEqual(["", ""]);
    expect(p.associations).toEqual([[], []]);
    expect(p.consigneSujet).toBe("");
  });

  it("initial 5.2 → 2 catégories vides, organisation 2-categories par défaut", () => {
    const p = initialManifestationsPayload("5.2");
    expect(p.comportementId).toBe("5.2");
    expect(p.organisationCategories).toBe("2-categories");
    expect(p.categories).toEqual(["", ""]);
  });

  it("merge applique le patch sur la base", () => {
    const base = initialManifestationsPayload("5.1");
    const next = mergeManifestationsPayload(base, { consigneSujet: "Test" });
    expect(next.consigneSujet).toBe("Test");
    expect(next.categories).toEqual(["", ""]);
  });

  it("merge depuis un raw null retourne un initial", () => {
    const r = mergeManifestationsPayload(null, { comportementId: "5.2" });
    expect(r.comportementId).toBe("5.2");
    expect(r.categories).toEqual(["", ""]);
  });
});

/* -------------------------------------------------------------------------- */
/*  normalizeManifestationsPayload                                              */
/* -------------------------------------------------------------------------- */

describe("manifestations-payload — normalize", () => {
  it("retourne null pour un raw vide ou non-objet", () => {
    expect(normalizeManifestationsPayload(null)).toBeNull();
    expect(normalizeManifestationsPayload("string")).toBeNull();
    expect(normalizeManifestationsPayload(42)).toBeNull();
  });

  it("retourne null pour un comportementId manquant", () => {
    expect(normalizeManifestationsPayload({})).toBeNull();
  });

  it("rétro-compatible : remplit les champs manquants avec valeurs par défaut", () => {
    const r = normalizeManifestationsPayload({ comportementId: "5.1" });
    expect(r).not.toBeNull();
    expect(r!.consigneSujet).toBe("");
    expect(r!.organisationCategories).toBe("2-categories");
    expect(r!.categories).toEqual(["", ""]);
    expect(r!.associations).toEqual([[], []]);
  });

  it("normalise un payload 5.2 + 4-categories complet", () => {
    const raw = payload52_4catComplete();
    const r = normalizeManifestationsPayload(raw);
    expect(r).toEqual(raw);
  });

  it("ajuste la longueur des catégories selon comportement/organisation", () => {
    // 5.1 → forcé à 2 catégories même si plus en input
    const r = normalizeManifestationsPayload({
      comportementId: "5.1",
      categories: ["A", "B", "C", "D"],
    });
    expect(r!.categories).toHaveLength(2);
    expect(r!.categories).toEqual(["A", "B"]);
  });

  it("rejette les schemaVersion futurs", () => {
    expect(normalizeManifestationsPayload({ ...payload51Complete(), schemaVersion: 2 })).toBeNull();
  });

  it("filtre les valeurs non-entières dans associations", () => {
    const r = normalizeManifestationsPayload({
      comportementId: "5.1",
      associations: [[1.5, "a", 1], [2]],
    });
    expect(r!.associations[0]).toEqual([1]);
    expect(r!.associations[1]).toEqual([2]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Gates                                                                      */
/* -------------------------------------------------------------------------- */

describe("manifestations-payload — isManifestationsStep3Complete", () => {
  it("valide un payload 5.1 complet", () => {
    expect(isManifestationsStep3Complete(payload51Complete())).toBe(true);
  });

  it("rejette si sujet vide", () => {
    expect(isManifestationsStep3Complete({ ...payload51Complete(), consigneSujet: "  " })).toBe(
      false,
    );
  });

  it("rejette si une catégorie est vide", () => {
    expect(
      isManifestationsStep3Complete({
        ...payload51Complete(),
        categories: ["Tradition orale", ""],
      }),
    ).toBe(false);
  });

  it("rejette si nombre de catégories incohérent avec organisation", () => {
    expect(
      isManifestationsStep3Complete({
        ...payload52_4catComplete(),
        categories: ["A", "B"],
      }),
    ).toBe(false);
  });
});

describe("manifestations-payload — isManifestationsStep5Complete", () => {
  it("valide les 3 cas standards", () => {
    expect(isManifestationsStep5Complete(payload51Complete())).toBe(true);
    expect(isManifestationsStep5Complete(payload52_2catComplete())).toBe(true);
    expect(isManifestationsStep5Complete(payload52_4catComplete())).toBe(true);
  });

  it("rejette si associations vides", () => {
    expect(
      isManifestationsStep5Complete({
        ...payload51Complete(),
        associations: [[], []],
      }),
    ).toBe(false);
  });

  it("rejette si doublon entre catégories", () => {
    expect(
      isManifestationsStep5Complete({
        ...payload51Complete(),
        associations: [[1], [1]],
      }),
    ).toBe(false);
  });
});

describe("manifestations-payload — isManifestationsDocumentsStepComplete", () => {
  it("valide quand tous les slots sont complets", () => {
    const slots = [{ slotId: "doc_1" as DocumentSlotId }, { slotId: "doc_2" as DocumentSlotId }];
    const docs: Partial<Record<DocumentSlotId, DocumentSlotData>> = {
      doc_1: completeSlot("doc_1"),
      doc_2: completeSlot("doc_2"),
    };
    expect(isManifestationsDocumentsStepComplete(slots, docs)).toBe(true);
  });

  it("rejette si un slot est vide", () => {
    const slots = [{ slotId: "doc_1" as DocumentSlotId }, { slotId: "doc_2" as DocumentSlotId }];
    const docs: Partial<Record<DocumentSlotId, DocumentSlotData>> = {
      doc_1: completeSlot("doc_1"),
    };
    expect(isManifestationsDocumentsStepComplete(slots, docs)).toBe(false);
  });

  it("rejette pour aucun slot déclaré", () => {
    expect(isManifestationsDocumentsStepComplete([], {})).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Builders HTML                                                              */
/* -------------------------------------------------------------------------- */

describe("manifestations-payload — buildManifestationsConsigneHtml", () => {
  it("5.1 : génère le HTML feuille élève avec tokens {{doc_1}} et {{doc_2}}", () => {
    const html = buildManifestationsConsigneHtml(payload51Complete());
    expect(html).toContain('data-manifestations-eleve="true"');
    expect(html).toContain("{{doc_1}}");
    expect(html).toContain("{{doc_2}}");
    expect(html).toContain("Tradition orale");
    expect(html).toContain("Partage des biens");
  });

  it("5.2 + 2-categories : 2 cellules avec 2 cases + séparateur 'et'", () => {
    const html = buildManifestationsConsigneHtml(payload52_2catComplete());
    expect(html).toContain("{{doc_1}} à {{doc_4}}");
    // 2 cellules × 2 cases = 4 cases au total
    const caseCount = (html.match(/"manifestations-eleve-case"/g) || []).length;
    expect(caseCount).toBe(4);
    expect(html).toContain("manifestations-eleve-et");
  });

  it("5.2 + 4-categories : 4 cellules avec 1 case chacune (pas de 'et')", () => {
    const html = buildManifestationsConsigneHtml(payload52_4catComplete());
    const caseCount = (html.match(/"manifestations-eleve-case"/g) || []).length;
    expect(caseCount).toBe(4);
    expect(html).not.toContain("manifestations-eleve-et");
    expect(html).toContain("Gouverneur");
    expect(html).toContain("Capitaine de milice");
  });

  it("échappe le HTML dans le sujet et les labels de catégories (XSS)", () => {
    const p: ManifestationsPayload = {
      ...payload51Complete(),
      consigneSujet: "<script>alert('xss')</script>",
      categories: ["<img src=x>", "B"],
    };
    const html = buildManifestationsConsigneHtml(p);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;img src=x&gt;");
  });
});

describe("manifestations-payload — buildManifestationsCorrigeHtml", () => {
  it("5.1 : liste les 2 catégories avec leur doc assigné", () => {
    const html = buildManifestationsCorrigeHtml(payload51Complete());
    expect(html).toContain("Tradition orale");
    expect(html).toContain("Partage des biens");
    expect(html).toContain("1");
    expect(html).toContain("2");
  });

  it("5.2 + 2-categories : sépare les docs avec ' et '", () => {
    const html = buildManifestationsCorrigeHtml(payload52_2catComplete());
    expect(html).toContain("Droits");
    expect(html).toContain("Devoirs");
    expect(html).toContain("1 et 3");
    expect(html).toContain("2 et 4");
  });

  it("retourne '' si le payload n'est pas complet", () => {
    expect(buildManifestationsCorrigeHtml({ ...payload51Complete(), associations: [[], []] })).toBe(
      "",
    );
  });
});
