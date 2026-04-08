import { describe, expect, it } from "vitest";
import {
  normalizeDocumentsNewTypesFromLlm,
  normalizeImportedDocumentType,
} from "@/lib/tae/import/normalize-llm-aliases";

describe("normalizeImportedDocumentType", () => {
  it("accepte textuel / iconographique canoniques", () => {
    expect(normalizeImportedDocumentType("textuel")).toEqual({
      ok: true,
      value: "textuel",
      wasAliased: false,
    });
    expect(normalizeImportedDocumentType("iconographique")).toEqual({
      ok: true,
      value: "iconographique",
      wasAliased: false,
    });
  });

  it("mappe les alias anglais courants", () => {
    expect(normalizeImportedDocumentType("textual")).toEqual({
      ok: true,
      value: "textuel",
      wasAliased: true,
    });
    expect(normalizeImportedDocumentType("TEXTUAL")).toEqual({
      ok: true,
      value: "textuel",
      wasAliased: true,
    });
    expect(normalizeImportedDocumentType("iconographic")).toEqual({
      ok: true,
      value: "iconographique",
      wasAliased: true,
    });
  });

  it("rejette les valeurs inconnues", () => {
    expect(normalizeImportedDocumentType("image")).toEqual({ ok: false, raw: "image" });
  });
});

describe("normalizeDocumentsNewTypesFromLlm", () => {
  it("normalise un tableau mixte et rapporte les corrections", () => {
    const r = normalizeDocumentsNewTypesFromLlm([
      { type: "textual", titre: "a" },
      { type: "textuel", titre: "b" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.documents[0].type).toBe("textuel");
      expect(r.documents[1].type).toBe("textuel");
      expect(r.corrections).toEqual([{ index: 0, from: "textual", to: "textuel" }]);
    }
  });

  it("échoue si type absent ou non string", () => {
    const r = normalizeDocumentsNewTypesFromLlm([{ titre: "x" } as Record<string, unknown>]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors[0].index).toBe(0);
    }
  });
});
