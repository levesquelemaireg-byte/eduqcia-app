import { describe, expect, it } from "vitest";
import {
  allAvantApresPartitions,
  computeCorrectAvantPair,
  generateAvantApresOptionPartitions,
} from "@/lib/tae/non-redaction/avant-apres-helpers";
import {
  initialAvantApresPayload,
  normalizeAvantApresPayload,
  runAvantApresGeneration,
  validateAvantApresPayloadInvariants,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import { parseNonRedactionData } from "@/lib/tae/tae-form-hydrate";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tae/document-helpers";

function docSlot(annee: number): DocumentSlotData {
  return {
    ...emptyDocumentSlot(),
    mode: "create",
    type: "textuel",
    titre: "t",
    contenu: "c",
    source_citation: "src",
    source_type: "secondaire",
    repere_temporel: String(annee),
    annee_normalisee: annee,
  };
}

const fourDocs = (): Record<string, DocumentSlotData> => ({
  doc_A: docSlot(1900),
  doc_B: docSlot(1910),
  doc_C: docSlot(1920),
  doc_D: docSlot(1930),
});

describe("normalizeAvantApresPayload", () => {
  it("retourne null pour entrée null", () => {
    expect(normalizeAvantApresPayload(null)).toBeNull();
  });

  it("accepte brouillon non généré (options vides)", () => {
    const p = normalizeAvantApresPayload({
      theme: "t",
      repere: "r",
      anneeRepere: 1910,
      overrides: {},
      optionRows: [],
      correctLetter: "A",
      justification: "",
      generated: false,
    });
    expect(p).not.toBeNull();
    expect(p?.generated).toBe(false);
  });

  it("accepte anneeRepere chaîne AAAA–AAAA (fin de période inclusive)", () => {
    const p = normalizeAvantApresPayload({
      theme: "t",
      repere: "r",
      anneeRepere: "1541–1543",
      overrides: {},
      optionRows: [],
      correctLetter: "A",
      justification: "",
      generated: false,
    });
    expect(p).not.toBeNull();
    expect(p?.anneeRepere).toBe(1541);
    expect(p?.anneeRepereFin).toBe(1543);
  });

  it("rejette optionRows non vides si generated false", () => {
    const row = {
      letter: "A" as const,
      avantSlots: ["doc_A", "doc_B"] as const,
      apresSlots: ["doc_C", "doc_D"] as const,
    };
    expect(
      normalizeAvantApresPayload({
        theme: "t",
        repere: "r",
        anneeRepere: 1910,
        optionRows: [row],
        correctLetter: "A",
        justification: "",
        generated: false,
      }),
    ).toBeNull();
  });
});

describe("parseNonRedactionData (avant-apres)", () => {
  it("parse colonne valide", () => {
    const inner = {
      theme: "Thème",
      repere: "Rep",
      anneeRepere: 1910,
      overrides: {},
      optionRows: [],
      correctLetter: "B",
      justification: "",
      generated: false,
    };
    const r = parseNonRedactionData({ type: "avant-apres", payload: inner });
    expect(r?.type).toBe("avant-apres");
    if (r?.type === "avant-apres") {
      expect(r.payload.theme).toBe("Thème");
    }
  });

  it("retourne null si invariants KO (généré sans 4 options)", () => {
    expect(
      parseNonRedactionData({
        type: "avant-apres",
        payload: {
          theme: "x",
          repere: "y",
          anneeRepere: 1,
          overrides: {},
          optionRows: [],
          correctLetter: "A",
          justification: "",
          generated: true,
        },
      }),
    ).toBeNull();
  });
});

describe("avant-apres-helpers", () => {
  const slots = ["doc_A", "doc_B", "doc_C", "doc_D"] as const;
  const docs = fourDocs();

  it("computeCorrectAvantPair — repère 1915 → deux avant", () => {
    const r = computeCorrectAvantPair([...slots], docs, 1915, {});
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(new Set(r.pair)).toEqual(new Set(["doc_A", "doc_B"]));
    }
  });

  it("computeCorrectAvantPair — période 1541–1543 : deux avant strictement avant 1541", () => {
    const capDocs: Record<string, DocumentSlotData> = {
      doc_A: docSlot(1497),
      doc_B: docSlot(1534),
      doc_C: docSlot(1605),
      doc_D: docSlot(1608),
    };
    const r = computeCorrectAvantPair([...slots], capDocs, 1541, {}, 1543);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(new Set(r.pair)).toEqual(new Set(["doc_A", "doc_B"]));
    }
  });

  it("generateAvantApresOptionPartitions — RNG fixe déterministe", () => {
    let i = 0;
    const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.11, 0.12, 0.13];
    const rng = () => {
      const v = seq[i] ?? 0.5;
      i += 1;
      return v;
    };
    const a = generateAvantApresOptionPartitions([...slots], docs, 1915, {}, rng);
    i = 0;
    const b = generateAvantApresOptionPartitions([...slots], docs, 1915, {}, rng);
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(a.correctLetter).toBe(b.correctLetter);
      expect(a.optionRows).toEqual(b.optionRows);
    }
  });

  it("six partitions distinctes", () => {
    expect(allAvantApresPartitions()).toHaveLength(6);
  });
});

describe("validateAvantApresPayloadInvariants + mutation partielle", () => {
  it("rejette après suppression d’une ligne d’option", () => {
    const base = initialAvantApresPayload();
    const gen = runAvantApresGeneration(
      { ...base, theme: "t", repere: "r", anneeRepere: 1915 },
      ["doc_A", "doc_B", "doc_C", "doc_D"],
      fourDocs(),
      () => 0.42,
    );
    expect(gen.errorCode).toBeNull();
    const p = gen.payload;
    const broken = { ...p, optionRows: p.optionRows.slice(0, 3) };
    expect(validateAvantApresPayloadInvariants(broken)).toBe(false);
  });
});
