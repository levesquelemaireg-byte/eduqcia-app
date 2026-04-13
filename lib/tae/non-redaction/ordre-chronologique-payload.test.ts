import { describe, expect, it } from "vitest";
import {
  ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR,
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueGuidageHtml,
  buildOrdreChronologiqueIntroHtml,
  clearedOrdreOptionsPatch,
  formatFrenchDocNumbersForWizardPreview,
  formatOrdreWizardDocTokenLabel,
  hasCompleteOrdreOptionsOnly,
  initialOrdreChronologiquePayload,
  normalizeOrdreChronologiquePayload,
  ordreChronologiqueCorrectPermutation,
  parseOrdreChronologiqueConsigneForStudentPrint,
  prepareOrdreChronologiqueConsigneForTeacherDisplay,
  stripOrdreChronologiqueStudentSheetGuidageAnchorForDisplay,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import type { OrdrePermutation } from "@/lib/tae/non-redaction/ordre-chronologique-permutations";

describe("ordre-chronologique-payload", () => {
  it("hasCompleteOrdreOptionsOnly est faux si les quatre lignes ne sont pas distinctes", () => {
    const row: OrdrePermutation = [1, 2, 3, 4];
    expect(
      hasCompleteOrdreOptionsOnly({
        optionA: row,
        optionB: row,
        optionC: [2, 1, 4, 3],
        optionD: [3, 4, 1, 2],
        correctLetter: "A",
      }),
    ).toBe(false);
  });

  it("hasCompleteOrdreOptionsOnly est vrai pour quatre permutations distinctes et une lettre valide", () => {
    expect(
      hasCompleteOrdreOptionsOnly({
        optionA: [1, 2, 3, 4],
        optionB: [2, 1, 4, 3],
        optionC: [3, 4, 1, 2],
        optionD: [4, 3, 2, 1],
        correctLetter: "C",
      }),
    ).toBe(true);
  });

  it("hasCompleteOrdreOptionsOnly est faux si correctLetter est vide", () => {
    const p = initialOrdreChronologiquePayload();
    expect(hasCompleteOrdreOptionsOnly(p)).toBe(false);
  });

  it("clearedOrdreOptionsPatch vide les quatre lignes et la lettre (contrat onChange null)", () => {
    const c = clearedOrdreOptionsPatch();
    expect(c.correctLetter).toBe("");
    expect(c.optionA.every((x) => x === null)).toBe(true);
    expect(hasCompleteOrdreOptionsOnly({ ...c })).toBe(false);
  });

  it("normalizeOrdreChronologiquePayload accepte un brouillon legacy avec consigneText seulement", () => {
    const row: OrdrePermutation = [1, 2, 3, 4];
    const p = normalizeOrdreChronologiquePayload({
      consigneText: "ancien textarea",
      optionA: row,
      optionB: [2, 1, 4, 3],
      optionC: [3, 4, 1, 2],
      optionD: [4, 3, 2, 1],
      correctLetter: "A",
    });
    expect(p).not.toBeNull();
    expect(p!.consigneTheme).toBe("");
  });

  it("buildOrdreChronologiqueIntroHtml contient les jetons {{doc_*}} et le thème échappé", () => {
    const h = buildOrdreChronologiqueIntroHtml("la <script>");
    expect(h).toContain("{{doc_A}}");
    expect(h).toContain("{{doc_D}}");
    expect(h).toContain("la &lt;script&gt;");
    expect(h).not.toContain("<script>");
  });

  it("buildOrdreChronologiqueConsigneHtml assemble intro + ancre + grille + réponse (sans guidage dans consigne)", () => {
    const row: OrdrePermutation = [1, 2, 3, 4];
    const html = buildOrdreChronologiqueConsigneHtml({
      consigneTheme: "x",
      optionA: row,
      optionB: [2, 1, 4, 3],
      optionC: [3, 4, 1, 2],
      optionD: [4, 3, 2, 1],
      correctLetter: "A",
      optionsJustification: "",
      manualTieBreakSequence: null,
    });
    expect(html).toContain("data-ordre-chrono-student");
    expect(html).toContain("{{doc_A}}");
    expect(html).toContain(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR);
    expect(html).not.toContain("data-ordre-chrono-embedded-guidage");
    const iIntro = html.indexOf("ordre-chrono-student-intro");
    const iAnchor = html.indexOf(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR);
    const iGrid = html.indexOf("ordre-chrono-student-grid");
    expect(iIntro).toBeGreaterThan(-1);
    expect(iAnchor).toBeGreaterThan(iIntro);
    expect(iGrid).toBeGreaterThan(iAnchor);
  });

  it("parseOrdreChronologiqueConsigneForStudentPrint et strip pour affichage enseignant", () => {
    const row: OrdrePermutation = [1, 2, 3, 4];
    const html = buildOrdreChronologiqueConsigneHtml({
      consigneTheme: "t",
      optionA: row,
      optionB: [2, 1, 4, 3],
      optionC: [3, 4, 1, 2],
      optionD: [4, 3, 2, 1],
      correctLetter: "A",
      optionsJustification: "",
      manualTieBreakSequence: null,
    });
    const parts = parseOrdreChronologiqueConsigneForStudentPrint(html);
    expect(parts).not.toBeNull();
    const merged = `${parts!.beforeGuidage}${buildOrdreChronologiqueGuidageHtml()}${parts!.afterGuidage}`;
    expect(merged).not.toContain(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR);
    expect(merged).toContain("ordre-chrono-student-intro");
    expect(merged).toContain("ordre-chrono-student-grid");
    const stripped = stripOrdreChronologiqueStudentSheetGuidageAnchorForDisplay(html);
    expect(stripped).not.toContain(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR);
    expect(stripped.indexOf("ordre-chrono-student-intro")).toBeLessThan(
      stripped.indexOf("ordre-chrono-student-grid"),
    );
  });

  it("prepareOrdreChronologiqueConsigneForTeacherDisplay retire ancre et bloc Réponse élève", () => {
    const row: OrdrePermutation = [1, 2, 3, 4];
    const html = buildOrdreChronologiqueConsigneHtml({
      consigneTheme: "t",
      optionA: row,
      optionB: [2, 1, 4, 3],
      optionC: [3, 4, 1, 2],
      optionD: [4, 3, 2, 1],
      correctLetter: "A",
      optionsJustification: "",
      manualTieBreakSequence: null,
    });
    const prep = prepareOrdreChronologiqueConsigneForTeacherDisplay(html);
    expect(prep).not.toContain(ORDRE_CHRONO_STUDENT_SHEET_GUIDAGE_ANCHOR);
    expect(prep).not.toContain("ordre-chrono-student-reponse");
    expect(prep).toContain("ordre-chrono-student-grid");
  });

  it("ordreChronologiqueCorrectPermutation lit la ligne de l’option correcte", () => {
    const row: OrdrePermutation = [3, 1, 4, 2];
    const p = {
      consigneTheme: "t",
      optionA: [1, 2, 3, 4] as OrdrePermutation,
      optionB: row,
      optionC: [2, 1, 4, 3] as OrdrePermutation,
      optionD: [4, 3, 2, 1] as OrdrePermutation,
      correctLetter: "B" as const,
      optionsJustification: "",
      manualTieBreakSequence: null,
    };
    expect(ordreChronologiqueCorrectPermutation(p)).toEqual(row);
  });

  it("formatOrdreWizardDocTokenLabel et formatFrenchDocNumbersForWizardPreview", () => {
    expect(formatOrdreWizardDocTokenLabel(0)).toBe("Doc");
    expect(formatOrdreWizardDocTokenLabel(1)).toBe("Doc 1");
    expect(formatOrdreWizardDocTokenLabel(4)).toBe("Doc 1–4");
    expect(formatFrenchDocNumbersForWizardPreview(4)).toBe("1, 2, 3 et 4");
  });

  it("buildOrdreChronologiqueGuidageHtml publie le guidage élève fixe", () => {
    const h = buildOrdreChronologiqueGuidageHtml();
    expect(h).toContain("indices de temps");
    expect(h).toContain("plus ancien au plus récent");
  });
});
