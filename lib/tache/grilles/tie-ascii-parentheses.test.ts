import { describe, expect, it } from "vitest";
import { tieAsciiParentheses } from "@/lib/tache/grilles/tie-ascii-parentheses";

const WJ = "\u2060";

describe("tieAsciiParentheses", () => {
  it("laisse une chaîne sans parenthèses inchangée", () => {
    expect(tieAsciiParentheses("2 points")).toBe("2 points");
  });

  it("lie les parenthèses au contenu", () => {
    expect(tieAsciiParentheses("faits (2 sur 2)")).toBe(`faits (${WJ}2 sur 2${WJ})`);
  });

  it("gère les parenthèses vides", () => {
    expect(tieAsciiParentheses("()")).toBe(`(${WJ}${WJ})`);
  });

  it("gère les parenthèses imbriquées", () => {
    expect(tieAsciiParentheses("(a (b))")).toBe(`(${WJ}a (${WJ}b${WJ})${WJ})`);
  });
});
