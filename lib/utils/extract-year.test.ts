import { describe, expect, it } from "vitest";
import { extractYearFromString } from "@/lib/utils/extract-year";

describe("extractYearFromString", () => {
  it("extrait la première séquence de quatre chiffres", () => {
    expect(extractYearFromString("vers 1760 et 1837")).toBe(1760);
    expect(extractYearFromString("juin 1834")).toBe(1834);
  });

  it("retourne null si aucune occurrence", () => {
    expect(extractYearFromString("âge de bronze")).toBeNull();
    expect(extractYearFromString("")).toBeNull();
  });
});
