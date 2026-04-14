import { describe, expect, it } from "vitest";
import { sortAuteursByFamilyName, splitDisplayName } from "@/lib/tae/auteur-display-sort";

describe("splitDisplayName", () => {
  it("splits 'Prénom Nom' correctly", () => {
    expect(splitDisplayName("Jean Tremblay")).toEqual({
      first_name: "Jean",
      last_name: "Tremblay",
    });
  });

  it("handles single word", () => {
    expect(splitDisplayName("Jean")).toEqual({ first_name: "Jean", last_name: "" });
  });

  it("handles empty string", () => {
    expect(splitDisplayName("")).toEqual({ first_name: "", last_name: "" });
  });

  it("splits compound first name on last space", () => {
    expect(splitDisplayName("Jean Pierre Tremblay")).toEqual({
      first_name: "Jean Pierre",
      last_name: "Tremblay",
    });
  });
});

describe("sortAuteursByFamilyName", () => {
  it("orders by family name (fr-CA)", () => {
    const sorted = sortAuteursByFamilyName([
      { id: "1", first_name: "Zoé", last_name: "Arsenault" },
      { id: "2", first_name: "Bob", last_name: "Bouchard" },
      { id: "3", first_name: "Anne", last_name: "Arsenault" },
    ]);
    expect(sorted.map((a) => `${a.first_name} ${a.last_name}`)).toEqual([
      "Anne Arsenault",
      "Zoé Arsenault",
      "Bob Bouchard",
    ]);
  });
});
