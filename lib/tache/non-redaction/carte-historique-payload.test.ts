import { describe, expect, it } from "vitest";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tache/document-helpers";
import {
  buildCarteHistoriqueConsigneHtml,
  buildCarteHistoriqueCorrigeHtml,
  clearedCarte22OptionsPatch,
  initialCarteHistoriquePayload,
  isCarteHistoriqueDocumentsPublishable,
  isCarteHistoriqueDocumentsStepComplete,
  isCarteHistoriqueStep3Complete,
  isCarteHistoriqueStep5Complete,
  mergeCarteHistoriquePayload,
  normalizeCarteHistoriquePayload,
  prepareCarteHistoriqueConsigneForTeacherDisplay,
  type CarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import { parseNonRedactionData } from "@/lib/tache/tache-form-hydrate";

function iconographicSlot(overrides: Partial<DocumentSlotData> = {}): DocumentSlotData {
  return {
    ...emptyDocumentSlot(),
    mode: "create",
    type: "iconographique",
    titre: "Carte du Canada 1763",
    source_citation: "BAnQ",
    source_type: "secondaire",
    repere_temporel: "1763",
    annee_normalisee: 1763,
    imageUrl: "https://example.com/carte.png",
    ...overrides,
  };
}

function slots(): { slotId: DocumentSlotId }[] {
  return [{ slotId: "doc_1" as DocumentSlotId }];
}

describe("normalizeCarteHistoriquePayload", () => {
  it("retourne null pour une entrée non objet", () => {
    expect(normalizeCarteHistoriquePayload(null)).toBeNull();
    expect(normalizeCarteHistoriquePayload("oups")).toBeNull();
    expect(normalizeCarteHistoriquePayload(undefined)).toBeNull();
  });

  it("retourne null si comportementId absent ou invalide", () => {
    expect(normalizeCarteHistoriquePayload({})).toBeNull();
    expect(normalizeCarteHistoriquePayload({ comportementId: "9.9" })).toBeNull();
  });

  it("accepte un payload 2.1 minimal", () => {
    const p = normalizeCarteHistoriquePayload({
      comportementId: "2.1",
      consigneElement1: "le territoire algonquien",
      consigneElement2: "",
      correctLetter: "C",
      correctChiffre1: null,
      correctChiffre2: null,
      optionA: null,
      optionB: null,
      optionC: null,
      optionD: null,
      generated22: false,
      correctLetter1: "",
      correctLetter2: "",
    });
    expect(p).not.toBeNull();
    expect(p?.comportementId).toBe("2.1");
    expect(p?.correctLetter).toBe("C");
  });

  it("rejette schemaVersion ≠ 1", () => {
    expect(normalizeCarteHistoriquePayload({ comportementId: "2.1", schemaVersion: 2 })).toBeNull();
  });

  it("retourne `null` si les options 2.2 sont incomplètes alors que generated22 est vrai", () => {
    expect(
      normalizeCarteHistoriquePayload({
        comportementId: "2.2",
        consigneElement1: "Acadie",
        consigneElement2: "Vallée du Saint-Laurent",
        correctLetter: "B",
        correctChiffre1: 4,
        correctChiffre2: 2,
        optionA: [3, 1],
        optionB: [4, 2],
        optionC: null,
        optionD: [4, 1],
        generated22: true,
        correctLetter1: "",
        correctLetter2: "",
      }),
    ).toBeNull();
  });

  it("accepte un payload 2.2 complètement généré", () => {
    const p = normalizeCarteHistoriquePayload({
      comportementId: "2.2",
      consigneElement1: "Acadie",
      consigneElement2: "Vallée du Saint-Laurent",
      correctLetter: "B",
      correctChiffre1: 4,
      correctChiffre2: 2,
      optionA: [3, 1],
      optionB: [4, 2],
      optionC: [3, 2],
      optionD: [4, 1],
      generated22: true,
      correctLetter1: "",
      correctLetter2: "",
    });
    expect(p).not.toBeNull();
    expect(p?.optionB).toEqual([4, 2]);
    expect(p?.correctLetter).toBe("B");
  });
});

describe("initialCarteHistoriquePayload", () => {
  it("crée un payload 2.1 par défaut", () => {
    const p = initialCarteHistoriquePayload();
    expect(p.comportementId).toBe("2.1");
    expect(p.correctLetter).toBe("");
    expect(p.generated22).toBe(false);
  });

  it("préserve le comportementId fourni", () => {
    expect(initialCarteHistoriquePayload("2.2").comportementId).toBe("2.2");
    expect(initialCarteHistoriquePayload("2.3").comportementId).toBe("2.3");
  });
});

describe("mergeCarteHistoriquePayload", () => {
  it("part d'un payload initial si prev est null", () => {
    const next = mergeCarteHistoriquePayload(null, { consigneElement1: "Acadie" });
    expect(next.consigneElement1).toBe("Acadie");
    expect(next.comportementId).toBe("2.1");
  });

  it("conserve les champs absents du patch", () => {
    const base: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.3"),
      correctLetter1: "A",
      correctLetter2: "B",
    };
    const next = mergeCarteHistoriquePayload(base, { correctLetter1: "C" });
    expect(next.correctLetter1).toBe("C");
    expect(next.correctLetter2).toBe("B");
  });

  it("permet de remettre une option 2.2 à null via patch explicite", () => {
    const base: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.2"),
      optionA: [3, 1],
    };
    const next = mergeCarteHistoriquePayload(base, { optionA: null });
    expect(next.optionA).toBeNull();
  });
});

describe("clearedCarte22OptionsPatch", () => {
  it("vide les options + correctLetter + generated22", () => {
    const patch = clearedCarte22OptionsPatch();
    expect(patch.optionA).toBeNull();
    expect(patch.optionB).toBeNull();
    expect(patch.optionC).toBeNull();
    expect(patch.optionD).toBeNull();
    expect(patch.correctLetter).toBe("");
    expect(patch.generated22).toBe(false);
  });
});

describe("isCarteHistoriqueStep3Complete", () => {
  it("2.1 — vrai si consigneElement1 non vide", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.1"),
      consigneElement1: "le territoire ",
    };
    expect(isCarteHistoriqueStep3Complete(p)).toBe(true);
  });

  it("2.1 — faux si consigneElement1 espaces seulement", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.1"),
      consigneElement1: "   ",
    };
    expect(isCarteHistoriqueStep3Complete(p)).toBe(false);
  });

  it("2.2 — exige les deux éléments", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.2"),
      consigneElement1: "Acadie",
      consigneElement2: "",
    };
    expect(isCarteHistoriqueStep3Complete(p)).toBe(false);
  });

  it("2.3 — exige les deux éléments", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.3"),
      consigneElement1: "rive nord",
      consigneElement2: "rive sud",
    };
    expect(isCarteHistoriqueStep3Complete(p)).toBe(true);
  });
});

describe("isCarteHistoriqueStep5Complete", () => {
  it("2.1 — vrai uniquement si correctLetter ∈ {A,B,C,D}", () => {
    const base = { ...initialCarteHistoriquePayload("2.1"), consigneElement1: "x" };
    expect(isCarteHistoriqueStep5Complete({ ...base, correctLetter: "" })).toBe(false);
    expect(isCarteHistoriqueStep5Complete({ ...base, correctLetter: "B" })).toBe(true);
  });

  it("2.2 — exige generated22, correctLetter, chiffres distincts, options non nulles", () => {
    const ok: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.2"),
      consigneElement1: "a",
      consigneElement2: "b",
      correctLetter: "B",
      correctChiffre1: 4,
      correctChiffre2: 2,
      optionA: [3, 1],
      optionB: [4, 2],
      optionC: [3, 2],
      optionD: [4, 1],
      generated22: true,
    };
    expect(isCarteHistoriqueStep5Complete(ok)).toBe(true);
    expect(isCarteHistoriqueStep5Complete({ ...ok, generated22: false })).toBe(false);
    expect(isCarteHistoriqueStep5Complete({ ...ok, correctLetter: "" })).toBe(false);
    expect(isCarteHistoriqueStep5Complete({ ...ok, correctChiffre1: 2, correctChiffre2: 2 })).toBe(
      false,
    );
  });

  it("2.3 — exige correctLetter1 et correctLetter2", () => {
    const base = {
      ...initialCarteHistoriquePayload("2.3"),
      consigneElement1: "a",
      consigneElement2: "b",
    };
    expect(
      isCarteHistoriqueStep5Complete({ ...base, correctLetter1: "A", correctLetter2: "" }),
    ).toBe(false);
    expect(
      isCarteHistoriqueStep5Complete({ ...base, correctLetter1: "A", correctLetter2: "C" }),
    ).toBe(true);
  });
});

describe("isCarteHistoriqueDocumentsStepComplete", () => {
  it("vrai si le slot unique a titre + image + repère + source", () => {
    const docs = { doc_1: iconographicSlot() } as Record<DocumentSlotId, DocumentSlotData>;
    expect(isCarteHistoriqueDocumentsStepComplete(slots(), docs)).toBe(true);
  });

  it("faux si repère temporel manquant", () => {
    const docs = {
      doc_1: iconographicSlot({ repere_temporel: "" }),
    } as Record<DocumentSlotId, DocumentSlotData>;
    expect(isCarteHistoriqueDocumentsStepComplete(slots(), docs)).toBe(false);
  });

  it("faux si aucun slot", () => {
    expect(isCarteHistoriqueDocumentsStepComplete([], {})).toBe(false);
  });
});

describe("isCarteHistoriqueDocumentsPublishable", () => {
  it("vrai si l'URL est publique HTTPS", () => {
    const docs = {
      doc_1: iconographicSlot({ imageUrl: "https://cdn.example.com/c.png" }),
    } as Record<DocumentSlotId, DocumentSlotData>;
    expect(isCarteHistoriqueDocumentsPublishable(slots(), docs)).toBe(true);
  });

  it("faux si imageUrl est un blob: (non publiable)", () => {
    const docs = {
      doc_1: iconographicSlot({ imageUrl: "blob:abc" }),
    } as Record<DocumentSlotId, DocumentSlotData>;
    expect(isCarteHistoriqueDocumentsPublishable(slots(), docs)).toBe(false);
  });
});

describe("buildCarteHistoriqueConsigneHtml", () => {
  it("2.1 — HTML feuille élève contient l'intro, la question avec l'élément et la zone réponse", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.1"),
      consigneElement1: "le territoire algonquien",
      correctLetter: "C",
    };
    const html = buildCarteHistoriqueConsigneHtml(p);
    expect(html).toContain('data-carte-historique-student="true"');
    expect(html).toContain("{{doc_1}}");
    expect(html).toContain("le territoire algonquien");
    expect(html).toContain("Réponse :");
  });

  it("2.2 — HTML contient un tableau avec les 4 paires et les en-têtes des 2 éléments", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.2"),
      consigneElement1: "Acadie",
      consigneElement2: "Vallée du Saint-Laurent",
      correctLetter: "B",
      correctChiffre1: 4,
      correctChiffre2: 2,
      optionA: [3, 1],
      optionB: [4, 2],
      optionC: [3, 2],
      optionD: [4, 1],
      generated22: true,
    };
    const html = buildCarteHistoriqueConsigneHtml(p);
    expect(html).toContain("<table");
    expect(html).toContain("Acadie");
    expect(html).toContain("Vallée du Saint-Laurent");
    expect(html).toContain("A)");
    expect(html).toContain("B)");
    expect(html).toContain("C)");
    expect(html).toContain("D)");
  });

  it("2.3 — HTML contient deux items <li> avec leur zone réponse propre", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.3"),
      consigneElement1: "rive nord",
      consigneElement2: "rive sud",
      correctLetter1: "A",
      correctLetter2: "C",
    };
    const html = buildCarteHistoriqueConsigneHtml(p);
    expect(html).toContain("<ul");
    expect(html).toContain("rive nord");
    expect(html).toContain("rive sud");
    expect((html.match(/<li/g) ?? []).length).toBe(2);
  });
});

describe("buildCarteHistoriqueCorrigeHtml", () => {
  it("2.1 — affiche la lettre", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.1"),
      consigneElement1: "x",
      correctLetter: "B",
    };
    expect(buildCarteHistoriqueCorrigeHtml(p)).toContain("Réponse attendue : B.");
  });

  it("2.2 — ajoute la justification chiffres ↔ éléments", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.2"),
      consigneElement1: "Acadie",
      consigneElement2: "Vallée du Saint-Laurent",
      correctLetter: "B",
      correctChiffre1: 4,
      correctChiffre2: 2,
      optionA: [3, 1],
      optionB: [4, 2],
      optionC: [3, 2],
      optionD: [4, 1],
      generated22: true,
    };
    const html = buildCarteHistoriqueCorrigeHtml(p);
    expect(html).toContain("Réponse attendue : B.");
    expect(html).toContain("4");
    expect(html).toContain("Acadie");
    expect(html).toContain("Vallée du Saint-Laurent");
  });

  it("2.3 — affiche les 2 lettres avec les 2 éléments", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.3"),
      consigneElement1: "rive nord",
      consigneElement2: "rive sud",
      correctLetter1: "A",
      correctLetter2: "C",
    };
    const html = buildCarteHistoriqueCorrigeHtml(p);
    expect(html).toContain("A pour rive nord");
    expect(html).toContain("C pour rive sud");
  });
});

describe("prepareCarteHistoriqueConsigneForTeacherDisplay", () => {
  it("retire le bloc réponse div (2.1, 2.2)", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.1"),
      consigneElement1: "x",
      correctLetter: "A",
    };
    const html = buildCarteHistoriqueConsigneHtml(p);
    const stripped = prepareCarteHistoriqueConsigneForTeacherDisplay(html);
    expect(stripped).not.toContain("carte-historique-student-reponse");
  });

  it("retire le bloc réponse span (2.3)", () => {
    const p: CarteHistoriquePayload = {
      ...initialCarteHistoriquePayload("2.3"),
      consigneElement1: "a",
      consigneElement2: "b",
      correctLetter1: "A",
      correctLetter2: "B",
    };
    const html = buildCarteHistoriqueConsigneHtml(p);
    const stripped = prepareCarteHistoriqueConsigneForTeacherDisplay(html);
    expect(stripped).not.toContain("carte-historique-student-reponse");
  });
});

describe("parseNonRedactionData (intégration carte historique)", () => {
  it("hydrate un variant carte-historique valide", () => {
    const result = parseNonRedactionData({
      type: "carte-historique",
      payload: {
        comportementId: "2.1",
        consigneElement1: "x",
        consigneElement2: "",
        correctLetter: "B",
        correctChiffre1: null,
        correctChiffre2: null,
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        generated22: false,
        correctLetter1: "",
        correctLetter2: "",
      },
    });
    expect(result?.type).toBe("carte-historique");
    if (result?.type === "carte-historique") {
      expect(result.payload.correctLetter).toBe("B");
    }
  });

  it("retourne null si payload illisible", () => {
    const result = parseNonRedactionData({
      type: "carte-historique",
      payload: { comportementId: "9.9" },
    });
    expect(result).toBeNull();
  });
});
