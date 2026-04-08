import { describe, expect, it } from "vitest";
import {
  buildOi35FullPlain,
  buildOi35IntroPlain,
  buildOi35TechnicalSummary,
  type Oi35Bloc3MockupInput,
} from "./oi35-bloc3-mockup";

const base: Oi35Bloc3MockupInput = {
  nature: "acteurs",
  structure: "grouped",
  enjeu: "un enjeu",
  repere: "en 1760",
};

describe("oi35-bloc3-mockup", () => {
  it("grouped : intro mentionne documents A, B et C (pas de n° questionnaire)", () => {
    const t = buildOi35IntroPlain(base);
    expect(t).toContain("documents A, B et C");
    expect(t.toLowerCase()).toContain("trois points de vue d'acteurs");
    expect(t.toLowerCase()).not.toContain("document 18");
    expect(t).not.toMatch(/n°\s*\d/);
  });

  it("separate : chacun un point de vue, sans ligne références questionnaire", () => {
    const t = buildOi35IntroPlain({ ...base, structure: "separate" });
    expect(t).toContain("Les documents A, B et C présentent chacun");
    expect(t).not.toContain("Références questionnaire");
    expect(t).not.toContain("documents n°");
  });

  it("historiens : formules avec « historien » / « historiens »", () => {
    const full = buildOi35FullPlain({ ...base, nature: "historiens" });
    expect(full).toContain("l'historien");
    expect(full).toContain("des deux autres historiens");
  });

  it("technical summary : 3 slots", () => {
    const s = buildOi35TechnicalSummary(base);
    expect(s.documentsNewCount).toBe(3);
    expect(s.slots.map((x) => x.slotId).join(",")).toBe("doc_A,doc_B,doc_C");
  });
});
