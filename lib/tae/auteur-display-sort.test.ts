import { describe, expect, it } from "vitest";
import { familyNameSortKey, sortAuteursByFamilyName } from "@/lib/tae/auteur-display-sort";

describe("familyNameSortKey", () => {
  it("uses segment before comma when present", () => {
    expect(familyNameSortKey("Tremblay, Jean")).toBe("Tremblay");
  });

  it("uses last whitespace-separated token otherwise", () => {
    expect(familyNameSortKey("Jean Tremblay")).toBe("Tremblay");
  });
});

describe("sortAuteursByFamilyName", () => {
  it("orders by family name (fr-CA)", () => {
    const sorted = sortAuteursByFamilyName([
      { id: "1", full_name: "Zoé Arsenault" },
      { id: "2", full_name: "Bob Bouchard" },
      { id: "3", full_name: "Anne Arsenault" },
    ]);
    expect(sorted.map((a) => a.full_name)).toEqual([
      "Anne Arsenault",
      "Zoé Arsenault",
      "Bob Bouchard",
    ]);
  });
});
