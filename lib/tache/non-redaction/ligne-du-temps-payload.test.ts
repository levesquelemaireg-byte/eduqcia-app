import { describe, expect, it } from "vitest";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsGuidageHtml,
  initialLigneDuTempsPayload,
  ligneDuTempsBoundaryErrors,
  ligneDuTempsHasBoundaryErrors,
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

  describe("ligneDuTempsBoundaryErrors", () => {
    it("aucune erreur quand toutes les bornes sont vides (frise vierge)", () => {
      const p = initialLigneDuTempsPayload();
      const errs = ligneDuTempsBoundaryErrors(p);
      expect(errs).toEqual([null, null, null, null]);
      expect(ligneDuTempsHasBoundaryErrors(p)).toBe(false);
    });

    it("aucune erreur quand toutes les bornes sont strictement croissantes", () => {
      expect(ligneDuTempsBoundaryErrors(sampleComplete3)).toEqual([null, null, null, null]);
      expect(ligneDuTempsHasBoundaryErrors(sampleComplete3)).toBe(false);
    });

    it("aucune erreur sur un préfixe rempli (saisie en cours)", () => {
      const p = mergeLigneDuTempsPayload(initialLigneDuTempsPayload(), {
        segmentCount: 4,
        boundaries: [1600, 1700, null, null, null],
      });
      // Borne 1700 OK ; les bornes vides ultérieures sont juste « à remplir », pas une erreur
      expect(ligneDuTempsBoundaryErrors(p)).toEqual([null, null, null, null, null]);
      expect(ligneDuTempsHasBoundaryErrors(p)).toBe(false);
    });

    it("missing : borne vide alors qu'une borne ultérieure est remplie", () => {
      const p = mergeLigneDuTempsPayload(initialLigneDuTempsPayload(), {
        segmentCount: 4,
        boundaries: [1600, null, 1800, null, 2000],
      });
      // index 1 et 3 vides, mais 2 et 4 remplis → missing pour 1 et 3
      expect(ligneDuTempsBoundaryErrors(p)).toEqual([null, "missing", null, "missing", null]);
      expect(ligneDuTempsHasBoundaryErrors(p)).toBe(true);
    });

    it("not-greater : date de fin ≤ date de début (régression période 3 dans la spec)", () => {
      const p = mergeLigneDuTempsPayload(initialLigneDuTempsPayload(), {
        segmentCount: 4,
        boundaries: [5, 6, 8, 7, null],
      });
      // index 3 (= 7) ≤ index 2 (= 8) → not-greater sur l'index 3
      expect(ligneDuTempsBoundaryErrors(p)).toEqual([null, null, null, "not-greater", null]);
      expect(ligneDuTempsHasBoundaryErrors(p)).toBe(true);
    });

    it("not-greater : égalité (≤ et non strictement <)", () => {
      const p = mergeLigneDuTempsPayload(initialLigneDuTempsPayload(), {
        segmentCount: 3,
        boundaries: [1700, 1700, 1800, 1900],
      });
      expect(ligneDuTempsBoundaryErrors(p)).toEqual([null, "not-greater", null, null]);
    });

    it("missing + not-greater cohabitent sur la même frise", () => {
      const p = mergeLigneDuTempsPayload(initialLigneDuTempsPayload(), {
        segmentCount: 4,
        boundaries: [1600, null, 1500, 1700, null],
      });
      // index 1 vide alors que 2 et 3 sont remplis → missing
      // index 2 (= 1500) ≤ 1600 (dernière borne valide précédente) → not-greater
      // index 4 vide mais aucune borne ultérieure remplie → null (pas une erreur, juste à remplir)
      expect(ligneDuTempsBoundaryErrors(p)).toEqual([null, "missing", "not-greater", null, null]);
    });
  });
});
