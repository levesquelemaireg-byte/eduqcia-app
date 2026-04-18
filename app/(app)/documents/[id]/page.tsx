import { notFound } from "next/navigation";
import { DocumentBankCompletionCard } from "@/components/documents/DocumentBankCompletionCard";
import { DocumentVueDetaillee } from "@/components/document/vue-detaillee";
import { hydrateRendererDocument } from "@/lib/documents/hydrate-renderer-document";
import { createClient } from "@/lib/supabase/server";
import { countPublishedTaeUsagesForDocument } from "@/lib/queries/document-read";
import { copyDocumentPublishedTaeUsageCount } from "@/lib/ui/ui-copy";

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
  const estAuteur = user?.id === doc.auteur_id;
  const showBankCompletion = estAuteur && doc.is_published === false;

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
    supabase.from("profiles").select("first_name, last_name").eq("id", doc.auteur_id).maybeSingle(),
  ]);

  const niveauLabels = (niveauRows.data ?? []).map((r) => r.label).join(", ");
  const disciplineLabels = (discRows.data ?? []).map((r) => r.label).join(", ");
  const connLabels = (connRows.data ?? []).map((r) => r.enonce).join(" · ");
  const aspectsStr = (doc.aspects_societe ?? []).join(", ");
  const authorName =
    profileRow.data && "first_name" in profileRow.data
      ? `${String(profileRow.data.first_name ?? "")} ${String(profileRow.data.last_name ?? "")}`.trim()
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
    <>
      {showBankCompletion && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <DocumentBankCompletionCard
            documentId={doc.id}
            initialRepere={typeof doc.repere_temporel === "string" ? doc.repere_temporel : ""}
            initialAnnee={
              typeof doc.annee_normalisee === "number" && Number.isFinite(doc.annee_normalisee)
                ? Math.trunc(doc.annee_normalisee)
                : null
            }
          />
        </div>
      )}
      <DocumentVueDetaillee
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
        estAuteur={estAuteur}
      />
    </>
  );
}
