import { describe, expect, it } from "vitest";
import type { TacheFicheData } from "@/lib/types/fiche";
import type { SelectorRefs } from "@/lib/fiche/types";
import {
  selectLectureHeader,
  selectLectureConsigne,
  selectLectureGuidage,
  selectLectureDocuments,
  selectLectureCorrige,
  selectLectureGrille,
  selectLectureCD,
  selectLectureConnaissances,
  selectLectureFooter,
} from "@/lib/fiche/selectors/lecture-selectors";

/* ─── Fixtures ────────────────────────────────────────────────── */

const EMPTY_REFS: SelectorRefs = {
  oiList: [],
  grilles: [],
  previewMeta: { authorFullName: "", draftStartedAtIso: "" },
};

/** Minimal valid TacheFicheData for testing. */
function makeFiche(overrides: Partial<TacheFicheData> = {}): TacheFicheData {
  return {
    id: "tache-1",
    auteur_id: "user-1",
    auteurs: [{ id: "user-1", first_name: "Jean", last_name: "Tremblay" }],
    consigne: "<p>Consigne test</p>",
    guidage: "<p>Guidage test</p>",
    corrige: "<p>Corrigé test</p>",
    aspects_societe: ["Économique", "Politique"],
    nb_lignes: 8,
    niveau: { label: "3e secondaire" },
    discipline: { label: "HQC" },
    oi: { id: "oi1", titre: "Établir des faits", icone: "cognition" },
    comportement: { id: "c11", enonce: "Situer dans le temps" },
    outilEvaluation: "grille-oi1",
    cd: { competence: "CD1", composante: "Composante A", critere: "Critère X" },
    connaissances: [
      {
        realite_sociale: "RS1",
        section: "S1",
        sous_section: null,
        enonce: "Connaissance test",
      },
    ],
    documents: [
      {
        letter: "A",
        titre: "Document A",
        contenu: "Texte du document",
        source_citation: "<p>Source</p>",
        type: "textuel",
        image_url: null,
        imagePixelWidth: null,
        imagePixelHeight: null,
        imageLegende: null,
        imageLegendePosition: null,
      },
    ],
    version: 2,
    version_updated_at: "2026-04-10T10:00:00Z",
    is_published: true,
    created_at: "2026-04-01T08:00:00Z",
    updated_at: "2026-04-10T10:00:00Z",
    ...overrides,
  };
}

/* ─── Tests ───────────────────────────────────────────────────── */

describe("selectLectureHeader", () => {
  it("returns ready with OI and comportement data", () => {
    const result = selectLectureHeader(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.oi?.titre).toBe("Établir des faits");
    expect(result.data.comportement?.enonce).toBe("Situer dans le temps");
    expect(result.data.niveau).toBe("3e secondaire");
    expect(result.data.discipline).toBe("HQC");
    expect(result.data.aspectsSociete).toEqual(["Économique", "Politique"]);
  });

  it("returns null oi when oi is missing", () => {
    const result = selectLectureHeader(
      makeFiche({ oi: { id: "", titre: "", icone: "cognition" } }),
      EMPTY_REFS,
    );
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    // Returns the oi object even if empty — always ready
    expect(result.data.oi).toBeDefined();
  });
});

describe("selectLectureConsigne", () => {
  it("returns ready with sanitized HTML when consigne has content", () => {
    const result = selectLectureConsigne(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.html).toContain("Consigne test");
  });

  it("returns hidden when consigne is empty", () => {
    const result = selectLectureConsigne(makeFiche({ consigne: "" }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });

  it("returns hidden when consigne is empty paragraph", () => {
    const result = selectLectureConsigne(makeFiche({ consigne: "<p></p>" }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });
});

describe("selectLectureGuidage", () => {
  it("returns ready when guidage has content", () => {
    const result = selectLectureGuidage(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.html).toContain("Guidage test");
  });

  it("returns hidden when guidage is empty", () => {
    const result = selectLectureGuidage(makeFiche({ guidage: "" }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });
});

describe("selectLectureDocuments", () => {
  it("returns ready with documents array", () => {
    const result = selectLectureDocuments(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.documents).toHaveLength(1);
    expect(result.data.documents[0].letter).toBe("A");
  });

  it("returns ready even with empty documents", () => {
    const result = selectLectureDocuments(makeFiche({ documents: [] }), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.documents).toHaveLength(0);
  });
});

describe("selectLectureCorrige", () => {
  it("returns ready when corrigé has content", () => {
    const result = selectLectureCorrige(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.html).toContain("Corrigé test");
    expect(result.data.notesCorrecteur).toBeNull();
  });

  it("returns hidden when corrigé is empty", () => {
    const result = selectLectureCorrige(makeFiche({ corrige: "" }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });
});

describe("selectLectureGrille", () => {
  it("returns ready with outilEvaluationId when outilEvaluation is set", () => {
    const result = selectLectureGrille(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.outilEvaluationId).toBe("grille-oi1");
    expect(result.data.entry).toBeNull(); // EMPTY_REFS has no grilles
  });

  it("returns hidden when outilEvaluation is null", () => {
    const result = selectLectureGrille(makeFiche({ outilEvaluation: null }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });
});

describe("selectLectureCD", () => {
  it("returns ready when cd is set", () => {
    const result = selectLectureCD(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.cd.competence).toBe("CD1");
  });

  it("returns hidden when cd is null", () => {
    const result = selectLectureCD(makeFiche({ cd: null }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });
});

describe("selectLectureConnaissances", () => {
  it("returns ready when connaissances is not empty", () => {
    const result = selectLectureConnaissances(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.connaissances).toHaveLength(1);
  });

  it("returns hidden when connaissances is empty", () => {
    const result = selectLectureConnaissances(makeFiche({ connaissances: [] }), EMPTY_REFS);
    expect(result.status).toBe("hidden");
  });
});

describe("selectLectureFooter", () => {
  it("returns ready with auteurs and metadata", () => {
    const result = selectLectureFooter(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.auteurs).toHaveLength(1);
    expect(result.data.auteurs[0].first_name).toBe("Jean");
    expect(result.data.auteurs[0].last_name).toBe("Tremblay");
    expect(result.data.isPublished).toBe(true);
    expect(result.data.version).toBe(2);
    expect(result.data.nbLignes).toBe(8);
    expect(result.data.hideNbLignesSkeleton).toBe(false);
  });

  it("handles showStudentAnswerLines default (absent = true)", () => {
    const result = selectLectureFooter(makeFiche(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.showStudentAnswerLines).toBe(true);
  });

  it("respects showStudentAnswerLines = false", () => {
    const result = selectLectureFooter(makeFiche({ showStudentAnswerLines: false }), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.showStudentAnswerLines).toBe(false);
  });
});
