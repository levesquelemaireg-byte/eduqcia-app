import { describe, expect, it } from "vitest";
import { isCdStepGateOk } from "@/lib/tae/cd-step-guards";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { initialTaeFormState } from "@/lib/tae/tae-form-state-types";

function minimalRedactionStateForCdGate(over: Partial<TaeFormState> = {}): TaeFormState {
  const s: TaeFormState = structuredClone(initialTaeFormState);
  s.bloc2 = {
    ...s.bloc2,
    niveau: "sec3",
    discipline: "hec",
    oiId: "x",
    comportementId: "y",
    nbLignes: 4,
    nbDocuments: 0,
    outilEvaluation: "z",
    blueprintLocked: true,
    documentSlots: [],
  };
  s.bloc3 = { consigne: "<p>ok</p>", guidage: "", perspectivesMode: null, perspectivesType: "acteurs", perspectivesContexte: "", oi6Enjeu: "", oi7EnjeuGlobal: "", oi7Element1: "", oi7Element2: "", oi7Element3: "", consigneMode: "gabarit" };
  s.bloc4 = { documents: {}, perspectives: null, perspectivesTitre: "", moments: null, momentsTitre: "" };
  s.bloc5 = { corrige: "<p>ok</p>", nonRedaction: null, intrus: null };
  s.bloc7 = {
    ...s.bloc7,
    aspects: {
      economique: false,
      politique: false,
      social: false,
      culturel: false,
      territorial: false,
    },
  };
  return { ...s, ...over };
}

describe("isCdStepGateOk", () => {
  it("réductionnel : ouvre l’étape CD sans aspects (étape 7) si consigne + corrigé + documents OK", () => {
    const state = minimalRedactionStateForCdGate();
    expect(isCdStepGateOk(state)).toBe(true);
  });

  it("réductionnel : refuse si corrigé vide alors que consigne OK", () => {
    const state = minimalRedactionStateForCdGate();
    state.bloc5.corrige = "";
    expect(isCdStepGateOk(state)).toBe(false);
  });
});
