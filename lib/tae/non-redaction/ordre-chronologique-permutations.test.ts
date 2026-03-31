import { describe, expect, it } from "vitest";
import {
  ORDRE_PERMUTATION_COUNT,
  areFourDistinctPermutations,
  emptyOrdreOptionRow,
  generateShuffledOrdreOptions,
  generateShuffledOrdreOptionsGuarded,
  isCompleteOrdrePermutation,
  parseLegacyOptionString,
  permutationsEqual,
  type OrdrePermutation,
} from "@/lib/tae/non-redaction/ordre-chronologique-permutations";

describe("ordre-chronologique-permutations", () => {
  it("énumère 24 permutations", () => {
    expect(ORDRE_PERMUTATION_COUNT).toBe(24);
  });

  it("rejette les lignes incomplètes ou avec doublon", () => {
    expect(isCompleteOrdrePermutation(emptyOrdreOptionRow())).toBe(false);
    expect(isCompleteOrdrePermutation([1, 1, 2, 3])).toBe(false);
    expect(isCompleteOrdrePermutation([1, 2, 3, 4])).toBe(true);
  });

  it("parse une chaîne legacy avec séparateurs", () => {
    const row = parseLegacyOptionString("ex. : 2 - 4 - 1 - 3");
    expect(isCompleteOrdrePermutation(row)).toBe(true);
    expect(row).toEqual([2, 4, 1, 3]);
  });

  it("areFourDistinctPermutations est faux si une même suite est répétée", () => {
    const p: OrdrePermutation = [1, 2, 3, 4];
    expect(areFourDistinctPermutations(p, p, p, p)).toBe(false);
  });

  it("generateShuffledOrdreOptionsGuarded retourne ok pour de nombreux tirages", () => {
    const correct: OrdrePermutation = [2, 4, 1, 3];
    for (let seed = 0; seed < 80; seed++) {
      let s = seed;
      const rng = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
      const out = generateShuffledOrdreOptionsGuarded(correct, rng);
      expect(out.ok).toBe(true);
      if (out.ok) {
        expect(
          areFourDistinctPermutations(
            out.data.optionA,
            out.data.optionB,
            out.data.optionC,
            out.data.optionD,
          ),
        ).toBe(true);
        const good = [out.data.optionA, out.data.optionB, out.data.optionC, out.data.optionD][
          "ABCD".indexOf(out.data.correctLetter)
        ]!;
        expect(permutationsEqual(good, correct)).toBe(true);
      }
    }
  });

  it("generateShuffledOrdreOptions produit 4 suites distinctes et conserve la bonne lettre", () => {
    const correct: OrdrePermutation = [1, 2, 3, 4];
    let seed = 12345;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const out = generateShuffledOrdreOptions(correct, rng);
    expect(areFourDistinctPermutations(out.optionA, out.optionB, out.optionC, out.optionD)).toBe(
      true,
    );
    const good = [out.optionA, out.optionB, out.optionC, out.optionD][
      "ABCD".indexOf(out.correctLetter)
    ]!;
    expect(permutationsEqual(good, correct)).toBe(true);
  });
});
