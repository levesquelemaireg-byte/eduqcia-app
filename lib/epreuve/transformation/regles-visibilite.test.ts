import { describe, expect, it } from "vitest";
import { estGuidageVisible, estTitreDocumentVisible } from "./regles-visibilite";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";

describe("estGuidageVisible", () => {
  it("est visible en formatif", () => {
    expect(estGuidageVisible("formatif")).toBe(true);
  });

  it.each(["sommatif-standard", "epreuve-ministerielle"] as ModeImpression[])(
    "est masqué en %s",
    (mode) => {
      expect(estGuidageVisible(mode)).toBe(false);
    },
  );
});

describe("estTitreDocumentVisible", () => {
  it("est visible en formatif", () => {
    expect(estTitreDocumentVisible("formatif")).toBe(true);
  });

  it.each(["sommatif-standard", "epreuve-ministerielle"] as ModeImpression[])(
    "est masqué en %s",
    (mode) => {
      expect(estTitreDocumentVisible(mode)).toBe(false);
    },
  );
});
