import { describe, expect, it } from "vitest";
import { parseEvaluationCompositionBody } from "@/lib/schemas/evaluation-composition";

describe("parseEvaluationCompositionBody", () => {
  it("accepte brouillon sans TAÉ", () => {
    const r = parseEvaluationCompositionBody(
      { evaluationId: null, titre: "  Mon titre  ", tacheIds: [] },
      false,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.titre).toBe("Mon titre");
      expect(r.data.tacheIds).toEqual([]);
    }
  });

  it("refuse publication sans TAÉ", () => {
    const r = parseEvaluationCompositionBody(
      { evaluationId: null, titre: "T", tacheIds: [] },
      true,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("publication_sans_tache");
  });

  it("refuse doublon d’UUID", () => {
    const u = "550e8400-e29b-41d4-a716-446655440000";
    const r = parseEvaluationCompositionBody(
      { evaluationId: null, titre: "T", tacheIds: [u, u] },
      false,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("doublon");
  });
});
