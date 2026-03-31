import { describe, expect, it } from "vitest";
import { shouldShowGuidageOnStudentSheet } from "@/lib/tae/consigne-helpers";

describe("consigne-helpers — shouldShowGuidageOnStudentSheet", () => {
  it("masque le guidage lorsque showGuidageOnStudentSheet est false", () => {
    expect(shouldShowGuidageOnStudentSheet("<p>Du texte</p>", false)).toBe(false);
  });

  it("affiche lorsque le drapeau est absent ou true et le HTML est significatif", () => {
    expect(shouldShowGuidageOnStudentSheet("<p>x</p>", true)).toBe(true);
    expect(shouldShowGuidageOnStudentSheet("<p>x</p>", undefined)).toBe(true);
  });

  it("n’affiche pas si le HTML est vide", () => {
    expect(shouldShowGuidageOnStudentSheet("", true)).toBe(false);
    expect(shouldShowGuidageOnStudentSheet("   ", undefined)).toBe(false);
  });
});
