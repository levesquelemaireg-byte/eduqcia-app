import { describe, expect, it } from "vitest";
import { formatSchoolForDisplay, parseSchoolJson } from "@/lib/profiles/school-json";

describe("school-json", () => {
  it("parseSchoolJson extrait css, ecole, niveau", () => {
    const s = JSON.stringify({
      css: "CSS Laval",
      ecole: "École B",
      niveau: "Sec 3",
    });
    expect(parseSchoolJson(s)).toEqual({
      css: "CSS Laval",
      ecole: "École B",
      niveau: "Sec 3",
    });
  });

  it("formatSchoolForDisplay : JSON → libellés, pas de accolades", () => {
    const s = JSON.stringify({
      css: "Centre de services scolaire de Laval",
      ecole: "École secondaire de test B",
      niveau: "Secondaire 3",
    });
    const out = formatSchoolForDisplay(s);
    expect(out).toContain("École secondaire de test B");
    expect(out).not.toContain("{");
    expect(out).not.toContain('"css"');
  });

  it("formatSchoolForDisplay : texte brut inchangé", () => {
    expect(formatSchoolForDisplay("  Mon école  ")).toBe("Mon école");
  });
});
