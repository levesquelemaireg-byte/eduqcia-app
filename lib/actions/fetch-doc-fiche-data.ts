"use server";

import { createClient } from "@/lib/supabase/server";
import { hydrateRendererDocument } from "@/lib/documents/hydrate-renderer-document";
import { copyDocumentPublishedTaeUsageCount } from "@/lib/ui/ui-copy";
import { countPublishedTaeUsagesForDocument } from "@/lib/queries/document-read";
import type { DocFicheData } from "@/lib/fiche/types";

type FetchResult = { ok: true; data: DocFicheData } | { ok: false; error: "auth" | "not_found" };

/**
 * Server Action — fetch DocFicheData pour un document par ID.
 * Utilisée par la modale fiche document embarquée (Phase 6).
 */
export async function fetchDocFicheDataAction(docId: string): Promise<FetchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: doc, error } = await supabase
    .from("documents")
    .select(
      "id, titre, type, structure, elements, repere_temporel, auteur_id, is_published, niveaux_ids, disciplines_ids, connaissances_ids, aspects_societe, created_at",
    )
    .eq("id", docId)
    .maybeSingle();

  if (error || !doc) return { ok: false, error: "not_found" };

  const niveauIds = doc.niveaux_ids ?? [];
  const discIds = doc.disciplines_ids ?? [];
  const connIds = doc.connaissances_ids ?? [];

  const [usageCount, niveauRows, discRows, connRows, profileRow] = await Promise.all([
    countPublishedTaeUsagesForDocument(supabase, docId),
    niveauIds.length
      ? supabase.from("niveaux").select("label").in("id", niveauIds)
      : Promise.resolve({ data: [] as { label: string }[] }),
    discIds.length
      ? supabase.from("disciplines").select("label").in("id", discIds)
      : Promise.resolve({ data: [] as { label: string }[] }),
    connIds.length
      ? supabase.from("connaissances").select("enonce").in("id", connIds)
      : Promise.resolve({ data: [] as { enonce: string }[] }),
    supabase.from("profiles").select("full_name").eq("id", doc.auteur_id).maybeSingle(),
  ]);

  const niveauLabels = (niveauRows.data ?? []).map((r) => r.label).join(", ");
  const disciplineLabels = (discRows.data ?? []).map((r) => r.label).join(", ");
  const connLabels = (connRows.data ?? []).map((r) => r.enonce).join(" · ");
  const aspectsStr = (doc.aspects_societe ?? []).join(", ");
  const authorName =
    profileRow.data && "full_name" in profileRow.data
      ? String(profileRow.data.full_name ?? "")
      : "";
  const created = doc.created_at
    ? new Date(doc.created_at).toLocaleDateString("fr-CA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const rendererDoc = hydrateRendererDocument(doc);
  const firstEl = rendererDoc.elements[0];
  const sourceType = firstEl?.sourceType ?? "secondaire";
  const sourceCitation = firstEl?.source ?? "";

  return {
    ok: true,
    data: {
      document: rendererDoc,
      sourceType,
      sourceCitation,
      niveauLabels,
      disciplineLabels,
      aspectsStr,
      connLabels,
      authorName,
      created,
      usageCaption: copyDocumentPublishedTaeUsageCount(usageCount),
      isPublished: doc.is_published ?? false,
    },
  };
}
