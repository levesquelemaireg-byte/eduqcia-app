import { describe, expect, it } from "vitest";
import { isCdStepGateOk } from "@/lib/tache/cd-step-guards";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { initialTacheFormState } from "@/lib/tache/tache-form-state-types";

function minimalRedactionStateForCdGate(over: Partial<TacheFormState> = {}): TacheFormState {
  const s: TacheFormState = structuredClone(initialTacheFormState);
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
  s.bloc3 = {
    consigne: "<p>ok</p>",
    guidage: "",
    perspectivesMode: null,
    perspectivesType: "acteurs",
    perspectivesContexte: "",
    oi6Enjeu: "",
    oi7EnjeuGlobal: "",
    oi7Element1: "",
    oi7Element2: "",
    oi7Element3: "",
    consigneMode: "gabarit",
  };
  s.bloc4 = {
    documents: {},
    perspectives: null,
    perspectivesTitre: "",
    moments: null,
    momentsTitre: "",
  };
  s.bloc5 = { corrige: "<p>ok</p>", notesCorrecteur: "", nonRedaction: null, intrus: null };
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

  it("perspectives groupé (3.3) : ouvre Bloc 6 si perspectives et corrigé complets", () => {
    const state = minimalRedactionStateForCdGate();
    state.bloc2.comportementId = "3.3";
    state.bloc2.nbDocuments = 2;
    state.bloc2.documentSlots = [{ slotId: "doc_A" }, { slotId: "doc_B" }];
    state.bloc3.perspectivesMode = "groupe";
    state.bloc4.perspectives = [
      {
        acteur: "François de Lévis",
        contenu: "<p>Extrait A</p>",
        source: "<p>Source A</p>",
        type: "textuel",
        sourceType: "primaire",
      },
      {
        acteur: "James Wolfe",
        contenu: "<p>Extrait B</p>",
        source: "<p>Source B</p>",
        type: "textuel",
        sourceType: "secondaire",
      },
    ];
    state.bloc4.perspectivesTitre = "Titre du document";
    expect(isCdStepGateOk(state)).toBe(true);
  });

  it("perspectives groupé (3.3) : refuse si perspectives incomplètes", () => {
    const state = minimalRedactionStateForCdGate();
    state.bloc2.comportementId = "3.3";
    state.bloc2.nbDocuments = 2;
    state.bloc2.documentSlots = [{ slotId: "doc_A" }, { slotId: "doc_B" }];
    state.bloc3.perspectivesMode = "groupe";
    state.bloc4.perspectives = null;
    state.bloc4.perspectivesTitre = "";
    expect(isCdStepGateOk(state)).toBe(false);
  });

  it("perspectives séparé (3.3) : utilise les documentSlots standard", () => {
    const state = minimalRedactionStateForCdGate();
    state.bloc2.comportementId = "3.3";
    state.bloc2.nbDocuments = 2;
    state.bloc2.documentSlots = [];
    state.bloc3.perspectivesMode = "separe";
    expect(isCdStepGateOk(state)).toBe(true);
  });
});
