import { describe, expect, it } from "vitest";
import {
  hecBranchNeedsSousColumn,
  hqcBranchNeedsSousColumn,
} from "@/lib/tache/connaissances-miller-rules";
import type { HecConnRow, HqcConnRow } from "@/lib/tache/connaissances-types";

describe("hecBranchNeedsSousColumn", () => {
  const rows: HecConnRow[] = [
    {
      kind: "hec",
      id: "1",
      niveau: "Secondaire 1",
      realite_sociale: "R",
      section: "S",
      sous_section: "SS",
      enonce: "e",
    },
  ];

  it("true si la branche a une sous-section", () => {
    expect(hecBranchNeedsSousColumn(rows, "R", "S")).toBe(true);
  });

  it("false si sous_section null", () => {
    const noSous: HecConnRow[] = [{ ...rows[0], sous_section: null }];
    expect(hecBranchNeedsSousColumn(noSous, "R", "S")).toBe(false);
  });

  it("false si branche absente", () => {
    expect(hecBranchNeedsSousColumn(rows, "X", "S")).toBe(false);
  });
});

describe("hqcBranchNeedsSousColumn", () => {
  const rows: HqcConnRow[] = [
    {
      kind: "hqc",
      id: "1",
      niveau: "Secondaire 3",
      periode: "P",
      realite_sociale: "R",
      section: "S",
      sous_section: "SS",
      enonce: "e",
    },
  ];

  it("true si (période, réalité, section) a une sous-section", () => {
    expect(hqcBranchNeedsSousColumn(rows, "P", "R", "S")).toBe(true);
  });
});
