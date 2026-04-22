"use server";

import { revalidatePath } from "next/cache";
import { autonomousDocumentFormSchema } from "@/lib/schemas/autonomous-document";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { resolveConnaissanceSelectionsToIds } from "@/lib/tache/publish-tae-lookups";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import { DOCUMENT_MODULE_CONNAISSANCES_LOOKUP_ERROR } from "@/lib/ui/ui-copy";
import { createClient } from "@/lib/supabase/server";
import { buildElementsJsonb } from "@/lib/documents/build-elements-jsonb";

export type CreateAutonomousDocumentResult =
  | { ok: true; documentId: string }
  | {
      ok: false;
      code: "auth" | "validation" | "db";
      fieldErrors?: Record<string, string>;
      /** Détail technique (ex. erreur PostgREST) — affiché en toast si présent. */
      message?: string;
    };

function aspectsToPgArray(aspects: Record<AspectSocieteKey, boolean>): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(aspects) as [AspectSocieteKey, boolean][]) {
    if (v) out.push(ASPECT_LABEL[k]);
  }
  return out;
}

export async function createAutonomousDocumentAction(
  raw: unknown,
): Promise<CreateAutonomousDocumentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const parsed = autonomousDocumentFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const iss of parsed.error.issues) {
      const path = iss.path.join(".") || "_form";
      if (!fieldErrors[path]) fieldErrors[path] = iss.message;
    }
    return { ok: false, code: "validation", fieldErrors };
  }

  const v = parsed.data;

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
  const elementsJsonb = buildElementsJsonb(v.elements);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      auteur_id: user.id,
      titre: v.titre,
      structure: v.structure,
      type: v.elements[0].type,
      elements: elementsJsonb,
      niveaux_ids: [v.niveau_id],
      disciplines_ids: [v.discipline_id],
      connaissances_ids: connIds,
      aspects_societe: aspectsPg,
      is_published: true,
      repere_temporel: repereTrim.length > 0 ? repereTrim : null,
      annee_normalisee:
        v.annee_normalisee != null && Number.isFinite(v.annee_normalisee)
          ? Math.trunc(v.annee_normalisee)
          : null,
    } as never)
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      ok: false,
      code: "db",
      message: error?.message ?? undefined,
    };
  }

  revalidatePath("/documents");
  revalidatePath("/bank");
  revalidatePath("/dashboard");

  return { ok: true, documentId: data.id as string };
}
