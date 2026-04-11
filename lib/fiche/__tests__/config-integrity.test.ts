import { describe, expect, it } from "vitest";
import { TAE_FICHE_SECTIONS } from "@/lib/fiche/configs/tae-fiche-sections";
import { TAE_LECTURE_SECTIONS } from "@/lib/fiche/configs/tae-lecture-sections";
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

describe("TAE_FICHE_SECTIONS (wizard)", () => {
  it("has unique IDs", () => {
    const ids = TAE_FICHE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all stepIds are valid", () => {
    for (const section of TAE_FICHE_SECTIONS) {
      expect(VALID_STEP_IDS).toContain(section.stepId);
    }
  });

  it("visibleIn contains only valid modes", () => {
    for (const section of TAE_FICHE_SECTIONS) {
      if (section.visibleIn) {
        for (const mode of section.visibleIn) {
          expect(VALID_MODES).toContain(mode);
        }
      }
    }
  });

  it("consigne and guidage share stepId 'consigne'", () => {
    const consigne = TAE_FICHE_SECTIONS.find((s) => s.id === "consigne");
    const guidage = TAE_FICHE_SECTIONS.find((s) => s.id === "guidage");
    expect(consigne?.stepId).toBe("consigne");
    expect(guidage?.stepId).toBe("consigne");
  });

  it("header and footer have null stepId", () => {
    const header = TAE_FICHE_SECTIONS.find((s) => s.id === "header");
    const footer = TAE_FICHE_SECTIONS.find((s) => s.id === "footer");
    expect(header?.stepId).toBeNull();
    expect(footer?.stepId).toBeNull();
  });

  it("grille, cd, connaissances, footer are hidden in thumbnail", () => {
    const expected = ["grille", "cd", "connaissances", "footer"];
    for (const id of expected) {
      const section = TAE_FICHE_SECTIONS.find((s) => s.id === id);
      expect(section?.visibleIn).toBeDefined();
      expect(section?.visibleIn).not.toContain("thumbnail");
    }
  });

  it("has exactly 9 sections", () => {
    expect(TAE_FICHE_SECTIONS).toHaveLength(9);
  });
});

describe("TAE_LECTURE_SECTIONS (lecture)", () => {
  it("has unique IDs", () => {
    const ids = TAE_LECTURE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has same IDs as wizard config", () => {
    const wizardIds = TAE_FICHE_SECTIONS.map((s) => s.id).sort();
    const lectureIds = TAE_LECTURE_SECTIONS.map((s) => s.id).sort();
    expect(lectureIds).toEqual(wizardIds);
  });

  it("all stepIds are valid", () => {
    for (const section of TAE_LECTURE_SECTIONS) {
      expect(VALID_STEP_IDS).toContain(section.stepId);
    }
  });

  it("only header and consigne visible in thumbnail", () => {
    const visibleInThumbnail = TAE_LECTURE_SECTIONS.filter(
      (s) => !s.visibleIn || s.visibleIn.includes("thumbnail"),
    );
    const ids = visibleInThumbnail.map((s) => s.id);
    expect(ids).toEqual(["header", "consigne"]);
  });

  it("has exactly 9 sections", () => {
    expect(TAE_LECTURE_SECTIONS).toHaveLength(9);
  });
});
