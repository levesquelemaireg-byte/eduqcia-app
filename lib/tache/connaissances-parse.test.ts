import { describe, expect, it } from "vitest";
import { connDataUrlForDiscipline, parseConnJsonArray } from "@/lib/tache/connaissances-parse";

describe("connDataUrlForDiscipline", () => {
  it("retourne le chemin JSON HEC / HQC", () => {
    expect(connDataUrlForDiscipline("hec")).toBe("/data/hec-sec1-2.json");
    expect(connDataUrlForDiscipline("hqc")).toBe("/data/hqc-sec3-4.json");
    expect(connDataUrlForDiscipline("geo")).toBeNull();
  });
});

describe("parseConnJsonArray", () => {
  it("ignore les entrées non tableau et les METADONNEES", () => {
    expect(parseConnJsonArray(null, "hec")).toEqual([]);
    expect(parseConnJsonArray({}, "hec")).toEqual([]);
    expect(
      parseConnJsonArray([{ TYPE_FICHIER: "METADONNEES", id: "x", enonce: "y" }], "hec"),
    ).toEqual([]);
  });

  it("parse une ligne HEC valide", () => {
    const rows = parseConnJsonArray(
      [
        {
          id: "h1",
          niveau: "Secondaire 1",
          realite_sociale: "R",
          section: "S",
          sous_section: null,
          enonce: "Énoncé",
        },
      ],
      "hec",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "hec",
      id: "h1",
      niveau: "Secondaire 1",
      realite_sociale: "R",
      section: "S",
      sous_section: null,
      enonce: "Énoncé",
    });
  });

  it("parse une ligne HQC avec période", () => {
    const rows = parseConnJsonArray(
      [
        {
          id: "q1",
          niveau: "Secondaire 3",
          periode: "P1",
          realite_sociale: "RQ",
          section: "SQ",
          sous_section: "SS",
          enonce: "E",
        },
      ],
      "hqc",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "hqc",
      id: "q1",
      periode: "P1",
      realite_sociale: "RQ",
      section: "SQ",
      sous_section: "SS",
      enonce: "E",
    });
  });

  it("ignore les lignes sans id ou enonce", () => {
    expect(parseConnJsonArray([{ id: "x" }], "hec")).toEqual([]);
    expect(parseConnJsonArray([{ enonce: "e" }], "hec")).toEqual([]);
  });
});
