import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeDocumentsNewTypesFromLlm } from "@/lib/tache/import/normalize-llm-aliases";
import { validateTaeImportVsOi } from "@/lib/tache/import/validate-tae-import-vs-oi";
import {
  normalizeAvantApresPayload,
  validateAvantApresPayloadInvariants,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import type { OiEntryJson } from "@/lib/types/oi";

const bundlePath = join(__dirname, "../../../public/data/import-tae-notebooklm-bundle.json");
const oiPath = join(__dirname, "../../../public/data/oi.json");

const oiList = JSON.parse(readFileSync(oiPath, "utf8")) as OiEntryJson[];

describe("import-tae-notebooklm-bundle.json — gabarits et pipeline import", () => {
  it("reference OI 1.3 : non_redaction_data normalisable et valide", () => {
    const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as {
      reference_payload_oi13_importable_cap_rouge: { tae: { non_redaction_data: unknown } };
    };
    const nr = bundle.reference_payload_oi13_importable_cap_rouge.tae.non_redaction_data;
    const p = normalizeAvantApresPayload(nr);
    expect(p).not.toBeNull();
    if (p) expect(validateAvantApresPayloadInvariants(p)).toBe(true);
  });

  it("reference OI 1.3 : validateTaeImportVsOi ok", () => {
    const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as {
      reference_payload_oi13_importable_cap_rouge: {
        tae: {
          conception_mode: string;
          oi_id: string;
          comportement_id: string;
          nb_lignes: number | null;
          niveau_id: number;
          discipline_id: number;
          non_redaction_data?: unknown;
        };
        documents_new: Array<{ niveaux_ids: number[]; disciplines_ids: number[] }>;
        slots: Array<{ mode?: string }>;
        collaborateurs_user_ids: unknown[];
      };
    };
    const ref = bundle.reference_payload_oi13_importable_cap_rouge;
    const v = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: ref.tae.conception_mode,
        oi_id: ref.tae.oi_id,
        comportement_id: ref.tae.comportement_id,
        nb_lignes: ref.tae.nb_lignes,
        niveau_id: ref.tae.niveau_id,
        discipline_id: ref.tae.discipline_id,
        non_redaction_data: ref.tae.non_redaction_data,
      },
      documents_new: ref.documents_new,
      slots: ref.slots,
      collaborateurs_user_ids: ref.collaborateurs_user_ids,
    });
    expect(v).toEqual({ ok: true });
  });

  it("reference OI 7.1 : ids alignés et validateTaeImportVsOi ok", () => {
    const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as {
      reference_payload_oi7_71_importable: {
        tae: {
          conception_mode: string;
          oi_id: string;
          comportement_id: string;
          nb_lignes: number | null;
          niveau_id: number;
          discipline_id: number;
          non_redaction_data?: unknown;
        };
        documents_new: Array<{ niveaux_ids: number[]; disciplines_ids: number[] }>;
        slots: Array<{ mode?: string }>;
        collaborateurs_user_ids: unknown[];
      };
    };
    const ref = bundle.reference_payload_oi7_71_importable;
    expect(ref.tae.non_redaction_data).toBeUndefined();
    const { niveau_id, discipline_id } = ref.tae;
    for (const d of ref.documents_new) {
      expect(d.niveaux_ids).toEqual([niveau_id]);
      expect(d.disciplines_ids).toEqual([discipline_id]);
    }
    const v = validateTaeImportVsOi(oiList, {
      tae: {
        conception_mode: ref.tae.conception_mode,
        oi_id: ref.tae.oi_id,
        comportement_id: ref.tae.comportement_id,
        nb_lignes: ref.tae.nb_lignes,
        niveau_id: ref.tae.niveau_id,
        discipline_id: ref.tae.discipline_id,
      },
      documents_new: ref.documents_new,
      slots: ref.slots,
      collaborateurs_user_ids: ref.collaborateurs_user_ids,
    });
    expect(v).toEqual({ ok: true });
  });

  it("normalise alias LLM (textual / iconographic) sur une copie du gabarit 7.1", () => {
    const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as {
      reference_payload_oi7_71_importable: { documents_new: Record<string, unknown>[] };
    };
    const base = bundle.reference_payload_oi7_71_importable.documents_new.map((d) => ({ ...d }));
    base[0] = { ...base[0], type: "textual" };
    base[1] = { ...base[1], type: "iconographic" };
    base[2] = { ...base[2], type: "textual" };
    const n = normalizeDocumentsNewTypesFromLlm(base);
    expect(n.ok).toBe(true);
    if (n.ok) {
      expect(n.documents[0].type).toBe("textuel");
      expect(n.documents[1].type).toBe("iconographique");
      expect(n.documents[2].type).toBe("textuel");
      expect(n.corrections).toEqual([
        { index: 0, from: "textual", to: "textuel" },
        { index: 1, from: "iconographic", to: "iconographique" },
        { index: 2, from: "textual", to: "textuel" },
      ]);
    }
  });
});
