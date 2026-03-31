"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isDocumentReadyForBank } from "@/lib/documents/document-bank-ready";
import { isAnneeNormaliseeInAllowedRange } from "@/lib/utils/annee-normalisee-bounds";
import type { Database } from "@/lib/types/database";
import { ERROR_ANNEE_NORMALISEE_RANGE } from "@/lib/ui/ui-copy";

const bodySchema = z.object({
  documentId: z.string().uuid(),
  repere_temporel: z.string(),
  annee_normalisee: z.union([z.number().int(), z.null()]),
});

export type UpdateDocumentBankFieldsResult =
  | { ok: true; isPublished: boolean }
  | { ok: false; code: "auth" | "forbidden" | "validation" | "db"; message?: string };

export async function updateDocumentBankFieldsAction(
  raw: unknown,
): Promise<UpdateDocumentBankFieldsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "validation", message: parsed.error.issues[0]?.message };
  }

  const { documentId, repere_temporel, annee_normalisee } = parsed.data;
  if (annee_normalisee != null && !isAnneeNormaliseeInAllowedRange(annee_normalisee)) {
    return { ok: false, code: "validation", message: ERROR_ANNEE_NORMALISEE_RANGE };
  }

  const { data: row, error: fetchErr } = await supabase
    .from("documents")
    .select(
      "auteur_id, niveaux_ids, disciplines_ids, connaissances_ids, aspects_societe, is_published",
    )
    .eq("id", documentId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, code: "db" };
  }

  const auteurId = row.auteur_id as string;
  if (auteurId !== user.id) {
    return { ok: false, code: "forbidden" };
  }

  const repereTrim = repere_temporel.trim();
  const repereDb = repereTrim.length > 0 ? repereTrim : null;

  const merged: Pick<
    Database["public"]["Tables"]["documents"]["Row"],
    "niveaux_ids" | "disciplines_ids" | "connaissances_ids" | "aspects_societe"
  > & {
    repere_temporel: string | null;
    annee_normalisee: number | null;
  } = {
    niveaux_ids: row.niveaux_ids ?? [],
    disciplines_ids: row.disciplines_ids ?? [],
    connaissances_ids: row.connaissances_ids ?? [],
    aspects_societe: row.aspects_societe ?? [],
    repere_temporel: repereDb,
    annee_normalisee: annee_normalisee,
  };

  const nextPublished = isDocumentReadyForBank(merged);

  const { error: upErr } = await supabase
    .from("documents")
    .update({
      repere_temporel: repereDb,
      annee_normalisee: annee_normalisee,
      is_published: nextPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("auteur_id", user.id);

  if (upErr) {
    return { ok: false, code: "db", message: upErr.message };
  }

  return { ok: true, isPublished: nextPublished };
}
