import { describe, expect, it } from "vitest";
import { splitGrilleParenSegments } from "@/lib/tae/grilles/split-paren-groups";

describe("splitGrilleParenSegments", () => {
  it("renvoie le texte entier s’il n’y a pas de parenthèses", () => {
    expect(splitGrilleParenSegments("2 points")).toEqual([{ kind: "text", value: "2 points" }]);
  });

  it("isole un groupe (…)", () => {
    expect(splitGrilleParenSegments("L’élève (1 sur 2) fin")).toEqual([
      { kind: "text", value: "L’élève " },
      { kind: "paren", value: "(1 sur 2)" },
      { kind: "text", value: " fin" },
    ]);
  });

  it("gère plusieurs groupes", () => {
    expect(splitGrilleParenSegments("a (1) b (2)")).toEqual([
      { kind: "text", value: "a " },
      { kind: "paren", value: "(1)" },
      { kind: "text", value: " b " },
      { kind: "paren", value: "(2)" },
    ]);
  });
});
