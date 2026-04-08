import { describe, expect, it } from "vitest";
import { determineSegmentIndexFromYear } from "@/lib/tae/non-redaction/ligne-du-temps-helpers";

describe("ligne-du-temps-helpers", () => {
  it("determineSegmentIndexFromYear — trois segments, demi-ouverts", () => {
    const b = [1000, 1500, 2000, 2020];
    expect(determineSegmentIndexFromYear(1000, b)).toBe(0);
    expect(determineSegmentIndexFromYear(1200, b)).toBe(0);
    expect(determineSegmentIndexFromYear(1499, b)).toBe(0);
    expect(determineSegmentIndexFromYear(1500, b)).toBe(1);
    expect(determineSegmentIndexFromYear(1999, b)).toBe(1);
    expect(determineSegmentIndexFromYear(2000, b)).toBe(2);
    expect(determineSegmentIndexFromYear(2019, b)).toBe(2);
  });

  it("determineSegmentIndexFromYear — hors bornes", () => {
    const b = [1000, 1500, 2000, 2020];
    expect(determineSegmentIndexFromYear(999, b)).toBeNull();
    expect(determineSegmentIndexFromYear(2020, b)).toBeNull();
    expect(determineSegmentIndexFromYear(3000, b)).toBeNull();
  });
});
