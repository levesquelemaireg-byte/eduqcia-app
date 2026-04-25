import { describe, expect, it } from "vitest";
import {
  allCarteHistoriquePairs,
  carteHistoriquePairsEqual,
  generateCarteHistorique22Options,
  isCarteHistoriqueChiffre,
  type CarteHistoriquePair,
} from "@/lib/tache/non-redaction/carte-historique-helpers";

describe("isCarteHistoriqueChiffre", () => {
  it("accepte 1, 2, 3, 4", () => {
    [1, 2, 3, 4].forEach((n) => expect(isCarteHistoriqueChiffre(n)).toBe(true));
  });

  it("rejette 0, 5, négatifs, non-numériques", () => {
    [0, 5, -1, 1.5, "1", null, undefined, {}].forEach((v) =>
      expect(isCarteHistoriqueChiffre(v)).toBe(false),
    );
  });
});

describe("allCarteHistoriquePairs", () => {
  it("énumère exactement 12 paires ordonnées (4 × 3)", () => {
    const pairs = allCarteHistoriquePairs();
    expect(pairs).toHaveLength(12);
  });

  it("chaque paire a deux chiffres distincts dans 1–4", () => {
    for (const [a, b] of allCarteHistoriquePairs()) {
      expect(a).not.toBe(b);
      expect([1, 2, 3, 4]).toContain(a);
      expect([1, 2, 3, 4]).toContain(b);
    }
  });

  it("toutes les paires sont uniques (clé `a,b`)", () => {
    const pairs = allCarteHistoriquePairs();
    const keys = new Set(pairs.map((p) => `${p[0]},${p[1]}`));
    expect(keys.size).toBe(12);
  });

  it("contient les 12 permutations attendues", () => {
    const pairs = allCarteHistoriquePairs();
    const keys = new Set(pairs.map((p) => `${p[0]},${p[1]}`));
    ["1,2", "1,3", "1,4", "2,1", "2,3", "2,4", "3,1", "3,2", "3,4", "4,1", "4,2", "4,3"].forEach(
      (k) => expect(keys.has(k)).toBe(true),
    );
  });
});

describe("generateCarteHistorique22Options", () => {
  /** RNG déterministe pour rendre la génération reproductible. */
  function makeRng(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  it("retourne null si les deux chiffres sont identiques", () => {
    expect(generateCarteHistorique22Options([2, 2] as CarteHistoriquePair, makeRng(1))).toBeNull();
  });

  it("retourne null si un chiffre est hors plage 1–4", () => {
    // @ts-expect-error — passage de chiffres hors plage (5) pour valider la garde runtime
    expect(generateCarteHistorique22Options([5, 2], makeRng(1))).toBeNull();
    // @ts-expect-error — passage de chiffres hors plage (0) pour valider la garde runtime
    expect(generateCarteHistorique22Options([1, 0], makeRng(1))).toBeNull();
  });

  it("génère 4 options (correcte + 3 distractrices) toutes distinctes", () => {
    const correct: CarteHistoriquePair = [4, 2];
    const result = generateCarteHistorique22Options(correct, makeRng(42));
    expect(result).not.toBeNull();
    if (!result) return;
    const all = [result.optionA, result.optionB, result.optionC, result.optionD];
    const keys = new Set(all.map((p) => `${p[0]},${p[1]}`));
    expect(keys.size).toBe(4);
  });

  it("la lettre correcte pointe sur la paire correcte exactement", () => {
    const correct: CarteHistoriquePair = [3, 1];
    const result = generateCarteHistorique22Options(correct, makeRng(123));
    expect(result).not.toBeNull();
    if (!result) return;
    const map: Record<typeof result.correctLetter, CarteHistoriquePair> = {
      A: result.optionA,
      B: result.optionB,
      C: result.optionC,
      D: result.optionD,
    };
    expect(carteHistoriquePairsEqual(map[result.correctLetter], correct)).toBe(true);
  });

  it("aucune distractrice n'est égale à la paire correcte", () => {
    const correct: CarteHistoriquePair = [1, 4];
    const result = generateCarteHistorique22Options(correct, makeRng(7));
    expect(result).not.toBeNull();
    if (!result) return;
    const all = [result.optionA, result.optionB, result.optionC, result.optionD];
    const correctOccurrences = all.filter((p) => carteHistoriquePairsEqual(p, correct)).length;
    expect(correctOccurrences).toBe(1);
  });

  it("le résultat varie selon le RNG (mélange réel)", () => {
    const correct: CarteHistoriquePair = [2, 3];
    const r1 = generateCarteHistorique22Options(correct, makeRng(1));
    const r2 = generateCarteHistorique22Options(correct, makeRng(99));
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
    if (!r1 || !r2) return;
    const sig = (r: typeof r1) =>
      `${r.correctLetter}|${r.optionA.join(",")}|${r.optionB.join(",")}|${r.optionC.join(",")}|${r.optionD.join(",")}`;
    expect(sig(r1)).not.toBe(sig(r2));
  });
});
