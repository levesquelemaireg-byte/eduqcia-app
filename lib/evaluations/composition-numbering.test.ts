import { describe, expect, it } from "vitest";
import {
  cumulativeDocRanges,
  formatDocRangeLabel,
  questionIndexForSlot,
} from "@/lib/evaluations/composition-numbering";

describe("cumulativeDocRanges", () => {
  it("numérote 2+2 en 1–2 et 3–4", () => {
    expect(cumulativeDocRanges([2, 2])).toEqual([
      { from: 1, to: 2 },
      { from: 3, to: 4 },
    ]);
  });

  it("gère 1 puis 3", () => {
    expect(cumulativeDocRanges([1, 3])).toEqual([
      { from: 1, to: 1 },
      { from: 2, to: 4 },
    ]);
  });

  it("gère zéro document sur une TAÉ", () => {
    expect(cumulativeDocRanges([2, 0, 1])).toEqual([
      { from: 1, to: 2 },
      { from: 0, to: 0 },
      { from: 3, to: 3 },
    ]);
  });
});

describe("formatDocRangeLabel", () => {
  it("singulier", () => {
    expect(formatDocRangeLabel({ from: 3, to: 3 })).toBe("Doc 3");
  });

  it("pluriel", () => {
    expect(formatDocRangeLabel({ from: 1, to: 4 })).toBe("Docs 1–4");
  });
});

describe("questionIndexForSlot", () => {
  it("1-based", () => {
    expect(questionIndexForSlot(0)).toBe(1);
    expect(questionIndexForSlot(2)).toBe(3);
  });
});
