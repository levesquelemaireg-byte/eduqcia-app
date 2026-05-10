import { describe, expect, it } from "vitest";
import {
  buildCausesConsequencesConsigneHtml,
  buildCausesConsequencesCorrigeHtml,
  causesConsequencesPayloadZodSchema,
  getCausesConsequencesCategoryLabels,
  initialCausesConsequencesPayload,
  isCausesConsequencesComportementId,
  isCausesConsequencesDocumentsPublishable,
  isCausesConsequencesDocumentsStepComplete,
  isCausesConsequencesStep3Complete,
  isCausesConsequencesStep5Complete,
  mergeCausesConsequencesPayload,
  normalizeCausesConsequencesPayload,
  type CausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { emptyDocumentSlot } from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";

const FIXED_SLOTS = [{ slotId: "doc_1" as DocumentSlotId }, { slotId: "doc_2" as DocumentSlotId }];

function completeTextualSlot(): DocumentSlotData {
  return {
    ...emptyDocumentSlot(),
    mode: "create",
    type: "textuel",
    titre: "Titre",
    source_citation: "<p>Source</p>",
    source_type: "primaire",
    contenu: "<p>Contenu textuel suffisant</p>",
    categorie_textuelle: "documents_officiels",
  };
}

function completeIconographicSlot(imageUrl = "https://example.com/img.png"): DocumentSlotData {
  return {
    ...emptyDocumentSlot(),
    mode: "create",
    type: "iconographique",
    titre: "Titre",
    source_citation: "<p>Source</p>",
    source_type: "primaire",
    imageUrl,
    image_legende: "",
    type_iconographique: "photo",
  };
}

describe("isCausesConsequencesComportementId", () => {
  it("accepte 4.3 et 4.4 uniquement", () => {
    expect(isCausesConsequencesComportementId("4.3")).toBe(true);
    expect(isCausesConsequencesComportementId("4.4")).toBe(true);
    expect(isCausesConsequencesComportementId("4.1")).toBe(false);
    expect(isCausesConsequencesComportementId("5.1")).toBe(false);
    expect(isCausesConsequencesComportementId(undefined)).toBe(false);
    expect(isCausesConsequencesComportementId(null)).toBe(false);
  });
});

describe("initialCausesConsequencesPayload", () => {
  it("retourne un payload 4.3 vide par défaut", () => {
    const p = initialCausesConsequencesPayload();
    expect(p.comportementId).toBe("4.3");
    expect(p.consigneSujet).toBe("");
    expect(p.associations).toEqual([null, null]);
    expect(p.schemaVersion).toBe(1);
  });

  it("respecte le comportementId fourni", () => {
    expect(initialCausesConsequencesPayload("4.4").comportementId).toBe("4.4");
  });
});

describe("Zod schema", () => {
  it("accepte un payload valide", () => {
    const r = causesConsequencesPayloadZodSchema.safeParse({
      schemaVersion: 1,
      comportementId: "4.3",
      consigneSujet: "Sujet",
      associations: [1, 2],
    });
    expect(r.success).toBe(true);
  });

  it("rejette les valeurs hors plage [1,2]", () => {
    const r = causesConsequencesPayloadZodSchema.safeParse({
      comportementId: "4.3",
      consigneSujet: "X",
      associations: [3, 1],
    });
    expect(r.success).toBe(false);
  });

  it("accepte null dans les associations", () => {
    const r = causesConsequencesPayloadZodSchema.safeParse({
      comportementId: "4.4",
      consigneSujet: "X",
      associations: [null, null],
    });
    expect(r.success).toBe(true);
  });

  it("rejette une longueur de tuple incorrecte", () => {
    const r = causesConsequencesPayloadZodSchema.safeParse({
      comportementId: "4.3",
      consigneSujet: "X",
      associations: [1],
    });
    expect(r.success).toBe(false);
  });
});

describe("normalizeCausesConsequencesPayload", () => {
  it("retourne null sur entrée invalide", () => {
    expect(normalizeCausesConsequencesPayload(null)).toBeNull();
    expect(normalizeCausesConsequencesPayload({})).toBeNull();
    expect(normalizeCausesConsequencesPayload({ comportementId: "4.5" })).toBeNull();
  });

  it("retourne null si schemaVersion ≠ 1", () => {
    expect(
      normalizeCausesConsequencesPayload({
        schemaVersion: 2,
        comportementId: "4.3",
        consigneSujet: "x",
        associations: [1, 2],
      }),
    ).toBeNull();
  });

  it("normalise correctement un payload valide 4.3", () => {
    const p = normalizeCausesConsequencesPayload({
      comportementId: "4.3",
      consigneSujet: "Sujet",
      associations: [1, 2],
    });
    expect(p).toEqual({
      schemaVersion: 1,
      comportementId: "4.3",
      consigneSujet: "Sujet",
      associations: [1, 2],
    });
  });

  it("filtre les valeurs hors plage en cellules null", () => {
    const p = normalizeCausesConsequencesPayload({
      comportementId: "4.4",
      consigneSujet: "x",
      associations: [3, 0],
    });
    expect(p?.associations).toEqual([null, null]);
  });

  it("complète les associations manquantes par null", () => {
    const p = normalizeCausesConsequencesPayload({
      comportementId: "4.3",
      consigneSujet: "x",
      associations: [1],
    });
    expect(p?.associations).toEqual([1, null]);
  });

  it("convertit consigneSujet non-string en chaîne vide", () => {
    const p = normalizeCausesConsequencesPayload({
      comportementId: "4.4",
      consigneSujet: 123,
      associations: [null, null],
    });
    expect(p?.consigneSujet).toBe("");
  });
});

describe("mergeCausesConsequencesPayload", () => {
  it("crée un payload initial si prev est invalide", () => {
    const p = mergeCausesConsequencesPayload(null, { consigneSujet: "X" });
    expect(p.consigneSujet).toBe("X");
    expect(p.comportementId).toBe("4.3");
    expect(p.associations).toEqual([null, null]);
  });

  it("respecte le comportementId du patch lorsqu'il y a fallback", () => {
    const p = mergeCausesConsequencesPayload(null, {
      comportementId: "4.4",
      consigneSujet: "X",
    });
    expect(p.comportementId).toBe("4.4");
  });

  it("préserve les champs non patchés", () => {
    const prev: CausesConsequencesPayload = {
      schemaVersion: 1,
      comportementId: "4.4",
      consigneSujet: "Sujet",
      associations: [1, 2],
    };
    const p = mergeCausesConsequencesPayload(prev, { consigneSujet: "Nouveau" });
    expect(p.consigneSujet).toBe("Nouveau");
    expect(p.comportementId).toBe("4.4");
    expect(p.associations).toEqual([1, 2]);
  });
});

describe("getCausesConsequencesCategoryLabels", () => {
  it("retourne 2 fois le même label pour 4.3", () => {
    const labels = getCausesConsequencesCategoryLabels("4.3", "la sédentarité");
    expect(labels).toEqual([
      "Un facteur explicatif de la sédentarité",
      "Un facteur explicatif de la sédentarité",
    ]);
  });

  it("retourne des labels courts indépendants du sujet pour 4.4 (Phase 8b correction 12)", () => {
    // Labels courts : la consigne (intro + liste à puces cause/conséquence)
    // rappelle déjà le sujet et la structure. Évite la redondance et le bug
    // de concaténation des prépositions ("de" + "du" → "de du").
    const labels = getCausesConsequencesCategoryLabels("4.4", "l'arrivée des loyalistes");
    expect(labels).toEqual(["Cause :", "Conséquence :"]);
  });

  it("trim le sujet", () => {
    const [a] = getCausesConsequencesCategoryLabels("4.3", "  X  ");
    expect(a).toBe("Un facteur explicatif de X");
  });
});

describe("isCausesConsequencesStep3Complete", () => {
  it("vrai si sujet non vide", () => {
    expect(
      isCausesConsequencesStep3Complete({
        ...initialCausesConsequencesPayload("4.3"),
        consigneSujet: "X",
      }),
    ).toBe(true);
  });

  it("faux si sujet vide ou whitespace", () => {
    expect(isCausesConsequencesStep3Complete(initialCausesConsequencesPayload())).toBe(false);
    expect(
      isCausesConsequencesStep3Complete({
        ...initialCausesConsequencesPayload(),
        consigneSujet: "   ",
      }),
    ).toBe(false);
  });
});

describe("isCausesConsequencesStep5Complete", () => {
  it("faux si une cellule est null", () => {
    expect(
      isCausesConsequencesStep5Complete({
        ...initialCausesConsequencesPayload(),
        associations: [1, null],
      }),
    ).toBe(false);
    expect(
      isCausesConsequencesStep5Complete({
        ...initialCausesConsequencesPayload(),
        associations: [null, 1],
      }),
    ).toBe(false);
  });

  it("faux si doublon", () => {
    expect(
      isCausesConsequencesStep5Complete({
        ...initialCausesConsequencesPayload(),
        associations: [1, 1],
      }),
    ).toBe(false);
    expect(
      isCausesConsequencesStep5Complete({
        ...initialCausesConsequencesPayload(),
        associations: [2, 2],
      }),
    ).toBe(false);
  });

  it("vrai si 2 cellules distinctes remplies", () => {
    expect(
      isCausesConsequencesStep5Complete({
        ...initialCausesConsequencesPayload(),
        associations: [1, 2],
      }),
    ).toBe(true);
    expect(
      isCausesConsequencesStep5Complete({
        ...initialCausesConsequencesPayload(),
        associations: [2, 1],
      }),
    ).toBe(true);
  });
});

describe("isCausesConsequencesDocumentsStepComplete", () => {
  it("faux si tableau de slots vide", () => {
    expect(isCausesConsequencesDocumentsStepComplete([], {})).toBe(false);
  });

  it("faux si un slot est incomplet", () => {
    expect(
      isCausesConsequencesDocumentsStepComplete(FIXED_SLOTS, {
        doc_1: completeTextualSlot(),
      }),
    ).toBe(false);
  });

  it("vrai si tous les slots sont complets", () => {
    expect(
      isCausesConsequencesDocumentsStepComplete(FIXED_SLOTS, {
        doc_1: completeTextualSlot(),
        doc_2: completeTextualSlot(),
      }),
    ).toBe(true);
  });
});

describe("isCausesConsequencesDocumentsPublishable", () => {
  it("vrai si tous les slots ont une URL HTTP publique pour les iconographiques", () => {
    expect(
      isCausesConsequencesDocumentsPublishable(FIXED_SLOTS, {
        doc_1: completeTextualSlot(),
        doc_2: completeIconographicSlot("https://cdn.example.com/img.png"),
      }),
    ).toBe(true);
  });

  it("faux si un slot iconographique a une URL non publique", () => {
    expect(
      isCausesConsequencesDocumentsPublishable(FIXED_SLOTS, {
        doc_1: completeTextualSlot(),
        doc_2: completeIconographicSlot("blob:abc"),
      }),
    ).toBe(false);
  });
});

describe("buildCausesConsequencesConsigneHtml", () => {
  it("4.3 — intro mono-paragraphe + 2 cellules identiques", () => {
    const html = buildCausesConsequencesConsigneHtml({
      schemaVersion: 1,
      comportementId: "4.3",
      consigneSujet: "la sédentarité",
      associations: [null, null],
    });
    expect(html).toContain('data-causes-consequences-eleve="true"');
    expect(html).toContain("Inscrivez dans la case appropriée");
    expect(html).toContain("Un facteur explicatif de la sédentarité");
    // 2 cellules
    expect((html.match(/causes-consequences-eleve-cellule/g) ?? []).length).toBe(2);
    // 2 cases
    expect((html.match(/causes-consequences-eleve-case/g) ?? []).length).toBe(2);
  });

  it("4.4 — intro avec liste à puces + 2 cellules avec labels courts (Phase 8b correction 12)", () => {
    const html = buildCausesConsequencesConsigneHtml({
      schemaVersion: 1,
      comportementId: "4.4",
      consigneSujet: "l'arrivée des loyalistes",
      associations: [null, null],
    });
    expect(html).toContain("causes-consequences-eleve-intro-list");
    // Liste à puces (intro) : sujet visible.
    expect(html).toContain("une cause de l'arrivée des loyalistes");
    expect(html).toContain("une conséquence de l'arrivée des loyalistes");
    // Labels des cellules : courts, indépendants du sujet (évite redondance).
    expect(html).toContain("Cause :");
    expect(html).toContain("Conséquence :");
  });

  it("échappe les caractères HTML du sujet", () => {
    const html = buildCausesConsequencesConsigneHtml({
      schemaVersion: 1,
      comportementId: "4.3",
      consigneSujet: "<script>alert('xss')</script>",
      associations: [null, null],
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("buildCausesConsequencesCorrigeHtml", () => {
  it("retourne une chaîne vide si étape 5 incomplète", () => {
    expect(
      buildCausesConsequencesCorrigeHtml({
        schemaVersion: 1,
        comportementId: "4.3",
        consigneSujet: "x",
        associations: [1, null],
      }),
    ).toBe("");
  });

  it("retourne une chaîne vide si doublon", () => {
    expect(
      buildCausesConsequencesCorrigeHtml({
        schemaVersion: 1,
        comportementId: "4.3",
        consigneSujet: "x",
        associations: [1, 1],
      }),
    ).toBe("");
  });

  it("4.3 — liste 2 items facteur explicatif", () => {
    const html = buildCausesConsequencesCorrigeHtml({
      schemaVersion: 1,
      comportementId: "4.3",
      consigneSujet: "la sédentarité",
      associations: [1, 2],
    });
    expect(html).toContain("Associations attendues");
    expect((html.match(/<li>/g) ?? []).length).toBe(2);
    expect(html).toContain("Un facteur explicatif de la sédentarité");
    expect(html).toContain(": 1");
    expect(html).toContain(": 2");
  });

  it("4.4 — distingue cause et conséquence (labels courts Phase 8b)", () => {
    const html = buildCausesConsequencesCorrigeHtml({
      schemaVersion: 1,
      comportementId: "4.4",
      consigneSujet: "l'arrivée",
      associations: [2, 1],
    });
    expect(html).toContain("Cause :");
    expect(html).toContain("Conséquence :");
    expect(html).toContain(": 2");
    expect(html).toContain(": 1");
  });

  it("échappe les caractères HTML du sujet", () => {
    const html = buildCausesConsequencesCorrigeHtml({
      schemaVersion: 1,
      comportementId: "4.3",
      consigneSujet: "<x>",
      associations: [1, 2],
    });
    expect(html).not.toContain("<x>");
    expect(html).toContain("&lt;x&gt;");
  });
});
