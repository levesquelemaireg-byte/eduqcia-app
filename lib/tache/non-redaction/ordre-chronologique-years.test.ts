import { describe, expect, it } from "vitest";
import { emptyDocumentSlot } from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  buildOrdreJustificationText,
  computeOrdreSequenceFromYears,
  resolveOrdreBaseSequenceForGeneration,
} from "@/lib/tache/non-redaction/ordre-chronologique-years";
import { emptyOrdreOptionRow } from "@/lib/tache/non-redaction/ordre-chronologique-permutations";

const ids = ["doc_A", "doc_B", "doc_C", "doc_D"] as DocumentSlotId[];

function slot(y: number | null, repere?: string) {
  return {
    ...emptyDocumentSlot(),
    annee_normalisee: y,
    ...(repere !== undefined ? { repere_temporel: repere } : {}),
  };
}

describe("ordre-chronologique-years", () => {
  it("calcule la séquence par années croissantes (indices documents 1–4)", () => {
    const documents = {
      doc_A: slot(2000),
      doc_B: slot(1500),
      doc_C: slot(1600),
      doc_D: slot(1400),
    };
    const r = computeOrdreSequenceFromYears(ids, documents);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.sequence).toEqual([4, 2, 3, 1]);
  });

  it("utilise l’année extraite du repère si `annee_normalisee` est absente", () => {
    const documents = {
      doc_A: slot(null, "circa 1400"),
      doc_B: slot(null, "1567"),
      doc_C: slot(null, "1789"),
      doc_D: slot(null, "1901"),
    };
    const r = computeOrdreSequenceFromYears(ids, documents);
    expect(r.kind).toBe("ok");
    if (r.kind !== "ok") return;
    expect(r.sequence).toEqual([1, 2, 3, 4]);
  });

  it("signale une année manquante", () => {
    const documents = {
      doc_A: slot(1000),
      doc_B: slot(1001),
      doc_C: slot(null),
      doc_D: slot(1003),
    };
    const r = computeOrdreSequenceFromYears(ids, documents);
    expect(r.kind).toBe("missing_years");
    if (r.kind !== "missing_years") return;
    expect(r.slotLetters).toContain("C");
  });

  it("signale une égalité d’années", () => {
    const documents = {
      doc_A: slot(1789),
      doc_B: slot(1789),
      doc_C: slot(1800),
      doc_D: slot(1900),
    };
    const r = computeOrdreSequenceFromYears(ids, documents);
    expect(r.kind).toBe("tie");
  });

  it("resolveOrdreBaseSequenceForGeneration — ok automatique", () => {
    const documents = {
      doc_A: slot(2000),
      doc_B: slot(1500),
      doc_C: slot(1600),
      doc_D: slot(1400),
    };
    const yearRes = computeOrdreSequenceFromYears(ids, documents);
    expect(yearRes.kind).toBe("ok");
    if (yearRes.kind !== "ok") return;
    const base = resolveOrdreBaseSequenceForGeneration(yearRes, null, emptyOrdreOptionRow());
    expect(base).toEqual([4, 2, 3, 1]);
  });

  it("buildOrdreJustificationText inclut les années", () => {
    const documents = {
      doc_A: slot(1456),
      doc_B: slot(1567),
      doc_C: slot(1789),
      doc_D: slot(1791),
    };
    const seq = [1, 3, 2, 4] as const;
    const t = buildOrdreJustificationText(seq, ids, documents, "A");
    expect(t).toContain("1456");
    expect(t).toContain("L’option A");
  });
});
