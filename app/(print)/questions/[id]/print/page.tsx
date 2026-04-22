import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TacheFichePrintView } from "@/components/tache/print/TacheFichePrintView";
import { createClient } from "@/lib/supabase/server";
import { fetchTacheFicheBundle } from "@/lib/tache/server-fiche-map";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Impression — ÉduQc.IA",
  robots: { index: false, follow: false },
};

export default async function QuestionPrintPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const bundle = await fetchTacheFicheBundle(supabase, id);
  if (!bundle) notFound();

  return <TacheFichePrintView tacheId={id} tache={bundle.fiche} />;
}
