import { describe, expect, it } from "vitest";
import { documentLegendPositionSchema, documentSourceTypeSchema } from "@/lib/schemas/document";

describe("documentSourceTypeSchema", () => {
  it("accepte primaire et secondaire", () => {
    expect(documentSourceTypeSchema.parse("primaire")).toBe("primaire");
    expect(documentSourceTypeSchema.parse("secondaire")).toBe("secondaire");
  });

  it("refuse une valeur inconnue", () => {
    expect(() => documentSourceTypeSchema.parse("autre")).toThrow();
  });
});

describe("documentLegendPositionSchema", () => {
  it("accepte les quatre coins", () => {
    expect(documentLegendPositionSchema.parse("haut_gauche")).toBe("haut_gauche");
    expect(documentLegendPositionSchema.parse("bas_droite")).toBe("bas_droite");
  });
});
