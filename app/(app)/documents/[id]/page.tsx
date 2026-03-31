import { notFound } from "next/navigation";
import { DocumentBankCompletionCard } from "@/components/documents/DocumentBankCompletionCard";
import { DocumentFicheRead } from "@/components/documents/DocumentFicheRead";
import { DocumentFicheRetourLink } from "@/components/documents/DocumentFicheRetourLink";
import { createClient } from "@/lib/supabase/server";
import { countPublishedTaeUsagesForDocument } from "@/lib/queries/document-read";
import { copyDocumentPublishedTaeUsageCount } from "@/lib/ui/ui-copy";
import { parseDocumentLegendPosition } from "@/lib/tae/document-helpers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentReadPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
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

  const legendText = typeof doc.image_legende === "string" ? doc.image_legende.trim() : "";
  const legendPos = parseDocumentLegendPosition(doc.image_legende_position);

  const sourceType =
    doc.source_type === "primaire" || doc.source_type === "secondaire"
      ? doc.source_type
      : "secondaire";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <DocumentFicheRetourLink />
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
      <DocumentFicheRead
        titre={doc.titre}
        docType={doc.type === "iconographique" ? "iconographique" : "textuel"}
        sourceType={sourceType}
        sourceCitation={doc.source_citation}
        niveauLabels={niveauLabels}
        disciplineLabels={disciplineLabels}
        aspectsStr={aspectsStr}
        connLabels={connLabels}
        authorName={authorName}
        created={created}
        usageCaption={copyDocumentPublishedTaeUsageCount(usageCount)}
        contenuHtml={doc.type === "textuel" && doc.contenu ? doc.contenu : null}
        imageUrl={doc.type === "iconographique" ? doc.image_url : null}
        legendText={legendText}
        legendPosition={legendPos}
      />
    </div>
  );
}
