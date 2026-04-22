import { describe, expect, it } from "vitest";
import { TACHE_FICHE_SECTIONS } from "@/lib/fiche/configs/tache-fiche-sections";
import { TACHE_LECTURE_SECTIONS } from "@/lib/fiche/configs/tache-lecture-sections";
import { DOC_FICHE_SECTIONS } from "@/lib/fiche/configs/doc-fiche-sections";
import type { FicheMode, StepId } from "@/lib/fiche/types";

const VALID_STEP_IDS: (StepId | null)[] = [
  null,
  "auteurs",
  "parametres",
  "consigne",
  "documents",
  "corrige",
  "cd",
  "connaissances",
];

const VALID_MODES: FicheMode[] = ["thumbnail", "sommaire", "lecture"];

describe("TACHE_FICHE_SECTIONS (wizard)", () => {
  it("has unique IDs", () => {
    const ids = TACHE_FICHE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all stepIds are valid", () => {
    for (const section of TACHE_FICHE_SECTIONS) {
      expect(VALID_STEP_IDS).toContain(section.stepId);
    }
  });

  it("visibleIn contains only valid modes", () => {
    for (const section of TACHE_FICHE_SECTIONS) {
      if (section.visibleIn) {
        for (const mode of section.visibleIn) {
          expect(VALID_MODES).toContain(mode);
        }
      }
    }
  });

  it("consigne and guidage share stepId 'consigne'", () => {
    const consigne = TACHE_FICHE_SECTIONS.find((s) => s.id === "consigne");
    const guidage = TACHE_FICHE_SECTIONS.find((s) => s.id === "guidage");
    expect(consigne?.stepId).toBe("consigne");
    expect(guidage?.stepId).toBe("consigne");
  });

  it("header and footer have null stepId", () => {
    const header = TACHE_FICHE_SECTIONS.find((s) => s.id === "header");
    const footer = TACHE_FICHE_SECTIONS.find((s) => s.id === "footer");
    expect(header?.stepId).toBeNull();
    expect(footer?.stepId).toBeNull();
  });

  it("grille, cd, connaissances, footer are hidden in thumbnail", () => {
    const expected = ["grille", "cd", "connaissances", "footer"];
    for (const id of expected) {
      const section = TACHE_FICHE_SECTIONS.find((s) => s.id === id);
      expect(section?.visibleIn).toBeDefined();
      expect(section?.visibleIn).not.toContain("thumbnail");
    }
  });

  it("has exactly 9 sections", () => {
    expect(TACHE_FICHE_SECTIONS).toHaveLength(9);
  });
});

describe("TACHE_LECTURE_SECTIONS (lecture)", () => {
  it("has unique IDs", () => {
    const ids = TACHE_LECTURE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has same IDs as wizard config", () => {
    const wizardIds = TACHE_FICHE_SECTIONS.map((s) => s.id).sort();
    const lectureIds = TACHE_LECTURE_SECTIONS.map((s) => s.id).sort();
    expect(lectureIds).toEqual(wizardIds);
  });

  it("all stepIds are valid", () => {
    for (const section of TACHE_LECTURE_SECTIONS) {
      expect(VALID_STEP_IDS).toContain(section.stepId);
    }
  });

  it("only header and consigne visible in thumbnail", () => {
    const visibleInThumbnail = TACHE_LECTURE_SECTIONS.filter(
      (s) => !s.visibleIn || s.visibleIn.includes("thumbnail"),
    );
    const ids = visibleInThumbnail.map((s) => s.id);
    expect(ids).toEqual(["header", "consigne"]);
  });

  it("has exactly 9 sections", () => {
    expect(TACHE_LECTURE_SECTIONS).toHaveLength(9);
  });
});

describe("DOC_FICHE_SECTIONS (document)", () => {
  it("has unique IDs", () => {
    const ids = DOC_FICHE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all stepIds are null (no wizard for documents)", () => {
    for (const section of DOC_FICHE_SECTIONS) {
      expect(section.stepId).toBeNull();
    }
  });

  it("visibleIn contains only valid modes", () => {
    for (const section of DOC_FICHE_SECTIONS) {
      if (section.visibleIn) {
        for (const mode of section.visibleIn) {
          expect(VALID_MODES).toContain(mode);
        }
      }
    }
  });

  it("only doc-header visible in thumbnail", () => {
    const visibleInThumbnail = DOC_FICHE_SECTIONS.filter(
      (s) => !s.visibleIn || s.visibleIn.includes("thumbnail"),
    );
    const ids = visibleInThumbnail.map((s) => s.id);
    expect(ids).toEqual(["doc-header"]);
  });

  it("has exactly 4 sections", () => {
    expect(DOC_FICHE_SECTIONS).toHaveLength(4);
  });

  it("all IDs are prefixed with 'doc-'", () => {
    for (const section of DOC_FICHE_SECTIONS) {
      expect(section.id).toMatch(/^doc-/);
    }
  });
});
