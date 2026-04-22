import { describe, expect, it } from "vitest";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsGuidageHtml,
  initialLigneDuTempsPayload,
  ligneDuTempsPartialPreviewBoundaries,
  mergeLigneDuTempsPayload,
  normalizeLigneDuTempsPayload,
  prepareLigneDuTempsConsigneForTeacherDisplay,
  prepareNonRedactionConsigneForTeacherDisplay,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";

const sampleComplete3: Parameters<typeof buildLigneDuTempsConsigneHtml>[0] = {
  variant: "ligne-du-temps-v1",
  segmentCount: 3,
  boundaries: [1600, 1700, 1800, 1900],
  correctLetter: "B",
};

describe("ligne-du-temps-payload", () => {
  it("initialLigneDuTempsPayload et merge conservent le discriminant", () => {
    const i = initialLigneDuTempsPayload();
    expect(i.variant).toBe("ligne-du-temps-v1");
    const m = mergeLigneDuTempsPayload(i, { segmentCount: 4 });
    expect(m.segmentCount).toBe(4);
    expect(m.boundaries.length).toBe(5);
  });

  it("normalizeLigneDuTempsPayload refuse segmentCount invalide", () => {
    expect(normalizeLigneDuTempsPayload({ segmentCount: 5 })).toBeNull();
    expect(normalizeLigneDuTempsPayload(null)).toBeNull();
  });

  it("ligneDuTempsPartialPreviewBoundaries expose un préfixe dès deux dates croissantes (4 segments)", () => {
    const p = {
      ...sampleComplete3,
      segmentCount: 4 as const,
      boundaries: [125, 335, null, null, null],
    };
    expect(ligneDuTempsPartialPreviewBoundaries(p)).toEqual([125, 335]);
  });

  it("ligneDuTempsPartialPreviewBoundaries s'arrête avant une date non croissante", () => {
    const p = {
      ...sampleComplete3,
      segmentCount: 4 as const,
      boundaries: [125, 335, 200, 400, 500],
    };
    expect(ligneDuTempsPartialPreviewBoundaries(p)).toEqual([125, 335]);
  });

  it("buildLigneDuTempsConsigneHtml assemble intro + frise + réponse (sans ancre — D0)", () => {
    const html = buildLigneDuTempsConsigneHtml(sampleComplete3);
    expect(html).toContain('data-ligne-temps-student="true"');
    expect(html).toContain("ligne-temps-student-intro");
    expect(html).not.toContain("<!--eduqcia:");
    expect(html).toContain("ligne-temps-frise");
    expect(html).toContain("ligne-temps-ribbon-svg");
    expect(html).toContain("clipPath");
    expect(html).toContain('<line x1="45"');
    const iIntro = html.indexOf("ligne-temps-student-intro");
    const iFrise = html.indexOf("ligne-temps-frise");
    expect(iIntro).toBeGreaterThan(-1);
    expect(iFrise).toBeGreaterThan(iIntro);
  });

  it("buildLigneDuTempsGuidageHtml produit un guidage séparé", () => {
    const h = buildLigneDuTempsGuidageHtml();
    expect(h).toContain("<p>");
    expect(h.length).toBeGreaterThan(0);
  });

  it("prepareLigneDuTempsConsigneForTeacherDisplay retire le bloc réponse élève", () => {
    const html = buildLigneDuTempsConsigneHtml(sampleComplete3);
    const prep = prepareLigneDuTempsConsigneForTeacherDisplay(html);
    expect(prep).not.toContain("ligne-temps-student-reponse");
    expect(prep).toContain("ligne-temps-frise");
  });

  it("prepareNonRedactionConsigneForTeacherDisplay enchaîne ordre puis ligne (noop si pas d'ordre)", () => {
    const html = buildLigneDuTempsConsigneHtml(sampleComplete3);
    const prep = prepareNonRedactionConsigneForTeacherDisplay(html);
    expect(prep).toContain("ligne-temps-frise");
  });
});
