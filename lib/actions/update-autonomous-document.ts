"use server";

import { autonomousDocumentUpdateFormSchema } from "@/lib/schemas/autonomous-document";
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { resolveConnaissanceSelectionsToIds } from "@/lib/tae/publish-tae-lookups";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import { DOCUMENT_MODULE_CONNAISSANCES_LOOKUP_ERROR } from "@/lib/ui/ui-copy";
import { createClient } from "@/lib/supabase/server";

export type UpdateAutonomousDocumentResult =
  | { ok: true }
  | {
      ok: false;
      code: "auth" | "forbidden" | "validation" | "db";
      fieldErrors?: Record<string, string>;
      message?: string;
    };

function aspectsToPgArray(aspects: Record<AspectSocieteKey, boolean>): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(aspects) as [AspectSocieteKey, boolean][]) {
    if (v) out.push(ASPECT_LABEL[k]);
  }
  return out;
}

export async function updateAutonomousDocumentAction(
  raw: unknown,
): Promise<UpdateAutonomousDocumentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const parsed = autonomousDocumentUpdateFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const iss of parsed.error.issues) {
      const path = iss.path.join(".") || "_form";
      if (!fieldErrors[path]) fieldErrors[path] = iss.message;
    }
    return { ok: false, code: "validation", fieldErrors };
  }

  const { document_id, ...v } = parsed.data;

  const { data: existing, error: fetchErr } = await supabase
    .from("documents")
    .select("auteur_id")
    .eq("id", document_id)
    .maybeSingle();

  if (fetchErr || !existing) return { ok: false, code: "db" };
  if (existing.auteur_id !== user.id) return { ok: false, code: "forbidden" };

  const { data: discRow, error: discErr } = await supabase
    .from("disciplines")
    .select("code")
    .eq("id", v.discipline_id)
    .maybeSingle();
  if (discErr || !discRow?.code || typeof discRow.code !== "string") {
    return {
      ok: false,
      code: "validation",
      fieldErrors: { discipline_id: "Discipline invalide." },
    };
  }
  const disciplineCode = String(discRow.code).toLowerCase() as DisciplineCode;

  const connIds = await resolveConnaissanceSelectionsToIds(
    supabase,
    v.discipline_id,
    disciplineCode,
    v.connaissances_miller,
  );
  if (connIds === null) {
    return {
      ok: false,
      code: "validation",
      fieldErrors: { connaissances_miller: DOCUMENT_MODULE_CONNAISSANCES_LOOKUP_ERROR },
    };
  }

  const aspectsPg = aspectsToPgArray(v.aspects);
  const repereTrim = (v.repere_temporel ?? "").trim();
  const legendTrim = v.image_legende?.trim() ?? "";
  const legendPos =
    v.doc_type === "iconographique" && legendTrim.length > 0
      ? (v.image_legende_position ?? null)
      : null;

  const typeIcono =
    v.doc_type === "iconographique" && v.type_iconographique != null ? v.type_iconographique : null;

  const { error: upErr } = await supabase
    .from("documents")
    .update({
      titre: v.titre,
      type: v.doc_type,
      contenu: v.doc_type === "textuel" ? (v.contenu ?? "").trim() : null,
      image_url: v.doc_type === "iconographique" ? (v.image_url ?? "").trim() : null,
      source_citation: v.source_citation.trim(),
      source_type: v.source_type,
      image_legende: legendTrim.length > 0 ? legendTrim : null,
      image_legende_position: legendPos,
      niveaux_ids: [v.niveau_id],
      disciplines_ids: [v.discipline_id],
      connaissances_ids: connIds,
      aspects_societe: aspectsPg,
      repere_temporel: repereTrim.length > 0 ? repereTrim : null,
      annee_normalisee:
        v.annee_normalisee != null && Number.isFinite(v.annee_normalisee)
          ? Math.trunc(v.annee_normalisee)
          : null,
      type_iconographique: typeIcono,
      updated_at: new Date().toISOString(),
    })
    .eq("id", document_id)
    .eq("auteur_id", user.id);

  if (upErr) {
    return { ok: false, code: "db", message: upErr.message };
  }

  return { ok: true };
}
