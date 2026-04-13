import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentBankCompletionCard } from "@/components/documents/DocumentBankCompletionCard";
import { DocumentFicheLecture } from "@/components/documents/DocumentFicheLecture";
import { DocumentFicheRetourLink } from "@/components/documents/DocumentFicheRetourLink";
import { hydrateRendererDocument } from "@/lib/documents/hydrate-renderer-document";
import { createClient } from "@/lib/supabase/server";
import { countPublishedTaeUsagesForDocument } from "@/lib/queries/document-read";
import { DOCUMENT_FICHE_EDIT, copyDocumentPublishedTaeUsageCount } from "@/lib/ui/ui-copy";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentReadPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("documents")
    .select(
      "id, titre, type, structure, elements, repere_temporel, annee_normalisee, auteur_id, is_published, niveaux_ids, disciplines_ids, connaissances_ids, aspects_societe, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !doc) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthor = user?.id === doc.auteur_id;
  const showBankCompletion = isAuthor && doc.is_published === false;

  const niveauIds = doc.niveaux_ids ?? [];
  const discIds = doc.disciplines_ids ?? [];
  const connIds = doc.connaissances_ids ?? [];

  const [usageCount, niveauRows, discRows, connRows, profileRow] = await Promise.all([
    countPublishedTaeUsagesForDocument(supabase, id),
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <DocumentFicheRetourLink />
        {isAuthor ? (
          <Link
            href={`/documents/${id}/edit`}
            className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
          >
            {DOCUMENT_FICHE_EDIT}
          </Link>
        ) : null}
      </div>
      {showBankCompletion ? (
        <DocumentBankCompletionCard
          documentId={doc.id}
          initialRepere={typeof doc.repere_temporel === "string" ? doc.repere_temporel : ""}
          initialAnnee={
            typeof doc.annee_normalisee === "number" && Number.isFinite(doc.annee_normalisee)
              ? Math.trunc(doc.annee_normalisee)
              : null
          }
        />
      ) : null}
      <DocumentFicheLecture
        data={{
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
        }}
      />
    </div>
  );
}
