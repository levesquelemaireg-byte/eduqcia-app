import { describe, expect, it } from "vitest";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";

describe("getVariantSlugForComportementId", () => {
  it("returns slug for declared non-rédaction comportements", () => {
    expect(getVariantSlugForComportementId("1.1")).toBe("ordre-chronologique");
    expect(getVariantSlugForComportementId("1.2")).toBe("ligne-du-temps");
    expect(getVariantSlugForComportementId("2.2")).toBe("carte-historique");
    expect(getVariantSlugForComportementId("4.4")).toBe("causes-consequences");
    expect(getVariantSlugForComportementId("5.1")).toBe("manifestations");
  });

  it("returns null for rédactionnel comportements", () => {
    expect(getVariantSlugForComportementId("0.1")).toBeNull();
    expect(getVariantSlugForComportementId("3.1")).toBeNull();
    expect(getVariantSlugForComportementId("")).toBeNull();
  });
});
