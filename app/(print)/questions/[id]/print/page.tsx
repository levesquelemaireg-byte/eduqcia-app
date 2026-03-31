import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaeFichePrintView } from "@/components/tae/print/TaeFichePrintView";
import { createClient } from "@/lib/supabase/server";
import { fetchTaeFicheBundle } from "@/lib/tae/server-fiche-map";

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
  const bundle = await fetchTaeFicheBundle(supabase, id);
  if (!bundle) notFound();

  return <TaeFichePrintView taeId={id} tae={bundle.fiche} />;
}
