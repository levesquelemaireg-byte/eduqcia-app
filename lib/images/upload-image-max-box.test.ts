import { describe, expect, it } from "vitest";
import { computeFinalDimensionsForUploadBox } from "@/lib/images/upload-image-max-box";

describe("computeFinalDimensionsForUploadBox", () => {
  it("conserve les dimensions si déjà dans la boîte", () => {
    expect(computeFinalDimensionsForUploadBox(100, 80)).toEqual({ width: 100, height: 80 });
    expect(computeFinalDimensionsForUploadBox(660, 400)).toEqual({ width: 660, height: 400 });
  });

  it("réduit selon la contrainte la plus restrictive (largeur)", () => {
    expect(computeFinalDimensionsForUploadBox(1320, 200)).toEqual({ width: 660, height: 100 });
  });

  it("réduit selon la contrainte la plus restrictive (hauteur)", () => {
    expect(computeFinalDimensionsForUploadBox(400, 800)).toEqual({ width: 200, height: 400 });
  });

  it("réduit les deux dimensions (ex. 1000×1000 → 400×400)", () => {
    expect(computeFinalDimensionsForUploadBox(1000, 1000)).toEqual({ width: 400, height: 400 });
  });

  it("rejette largeur ou hauteur non valides", () => {
    expect(() => computeFinalDimensionsForUploadBox(0, 100)).toThrow(RangeError);
    expect(() => computeFinalDimensionsForUploadBox(100, -1)).toThrow(RangeError);
    expect(() => computeFinalDimensionsForUploadBox(Number.NaN, 1)).toThrow(RangeError);
  });
});
