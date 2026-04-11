import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentPrintView } from "@/components/documents/DocumentPrintView";
import { hydrateRendererDocument } from "@/lib/documents/hydrate-renderer-document";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Impression document — ÉduQc.IA",
  robots: { index: false, follow: false },
};

export default async function DocumentPrintPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !doc) notFound();

  const rendererDoc = hydrateRendererDocument(doc);

  return <DocumentPrintView documentId={id} document={rendererDoc} numero={1} />;
}
