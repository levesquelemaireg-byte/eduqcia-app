import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateTaeImportVsOi } from "@/lib/tache/import/validate-tae-import-vs-oi";
import type { OiEntryJson } from "@/lib/types/oi";

const oiList = JSON.parse(
  readFileSync(join(__dirname, "../../../public/data/oi.json"), "utf8"),
) as OiEntryJson[];

describe("validateTaeImportVsOi", () => {
  it("accepte OI3 / 3.5 avec 3 documents alignés sur tae", () => {
    const r = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: "seul",
        oi_id: "OI3",
        comportement_id: "3.5",
        nb_lignes: 5,
        niveau_id: 3,
        discipline_id: 3,
      },
      documents_new: [
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
      ],
      slots: [{ mode: "create" }, { mode: "create" }, { mode: "create" }],
      collaborateurs_user_ids: [],
    });
    expect(r).toEqual({ ok: true });
  });

  it("refuse un désalignement niveau/discipline", () => {
    const r = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: "seul",
        oi_id: "OI3",
        comportement_id: "3.5",
        nb_lignes: 5,
        niveau_id: 3,
        discipline_id: 3,
      },
      documents_new: [{ niveaux_ids: [1], disciplines_ids: [3] }],
      slots: [{ mode: "create" }],
      collaborateurs_user_ids: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((x) => x.includes("niveaux_ids"))).toBe(true);
    }
  });

  it("refuse nb_lignes incohérent avec oi.json", () => {
    const r = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: "seul",
        oi_id: "OI3",
        comportement_id: "3.5",
        nb_lignes: 99,
        niveau_id: 3,
        discipline_id: 3,
      },
      documents_new: [
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
      ],
      slots: [{ mode: "create" }, { mode: "create" }, { mode: "create" }],
      collaborateurs_user_ids: [],
    });
    expect(r.ok).toBe(false);
  });

  it("exige non_redaction_data pour 1.3", () => {
    const r = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: "seul",
        oi_id: "OI1",
        comportement_id: "1.3",
        nb_lignes: 0,
        niveau_id: 3,
        discipline_id: 3,
      },
      documents_new: [
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
      ],
      slots: [{ mode: "create" }, { mode: "create" }, { mode: "create" }, { mode: "create" }],
      collaborateurs_user_ids: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((x) => x.includes("non_redaction_data"))).toBe(true);
    }
  });

  it("interdit non_redaction_data pour 7.1", () => {
    const r = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: "seul",
        oi_id: "OI7",
        comportement_id: "7.1",
        nb_lignes: 10,
        niveau_id: 3,
        discipline_id: 3,
        non_redaction_data: { foo: 1 },
      },
      documents_new: [
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
        { niveaux_ids: [3], disciplines_ids: [3] },
      ],
      slots: [{ mode: "create" }, { mode: "create" }, { mode: "create" }],
      collaborateurs_user_ids: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues.some((x) => x.includes("ne doit pas être présent"))).toBe(true);
    }
  });
});
