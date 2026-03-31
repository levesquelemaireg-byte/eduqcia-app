import { describe, expect, it } from "vitest";
import { NR_ORDRE_STUDENT_GUIDAGE } from "@/lib/ui/ui-copy";
import { initialTaeFormState } from "@/lib/tae/tae-form-state-types";
import { taeFormReducer } from "@/lib/tae/tae-form-reducer";

describe("taeFormReducer SET_COMPORTEMENT", () => {
  it("réinitialise le guidage pour éviter la fuite du texte fixe ordre chronologique vers un comportement rédactionnel", () => {
    const withOrdreGuidage = {
      ...initialTaeFormState,
      bloc2: {
        ...initialTaeFormState.bloc2,
        niveau: "sec5",
        discipline: "hec",
        oiId: "OI1",
        comportementId: "1.1",
        nbDocuments: 4,
        outilEvaluation: "OI1_SO1",
        nbLignes: 0,
        blueprintLocked: true,
        documentSlots: [
          { slotId: "doc_A" as const },
          { slotId: "doc_B" as const },
          { slotId: "doc_C" as const },
          { slotId: "doc_D" as const },
        ],
      },
      bloc3: {
        ...initialTaeFormState.bloc3,
        guidage: `<p>${NR_ORDRE_STUDENT_GUIDAGE}</p>`,
      },
    };

    const next = taeFormReducer(withOrdreGuidage, {
      type: "SET_COMPORTEMENT",
      comportementId: "0.1",
      nbDocuments: 1,
      outilEvaluation: "OI0_SO1",
      nbLignes: 2,
    });

    expect(next.bloc3.guidage).toBe("");
    expect(next.bloc2.comportementId).toBe("0.1");
  });
});
