import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EvaluationFichePrintView } from "@/components/evaluations/EvaluationFichePrintView";
import { createClient } from "@/lib/supabase/server";
import { fetchEvaluationPrintBundle } from "@/lib/queries/evaluation-print";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Impression — Épreuve — ÉduQc.IA",
  robots: { index: false, follow: false },
};

export default async function EvaluationPrintPage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const bundle = await fetchEvaluationPrintBundle(supabase, id, user.id);
  if (!bundle) notFound();

  return (
    <EvaluationFichePrintView
      evaluationId={bundle.evaluationId}
      titre={bundle.titre}
      fiches={bundle.fiches}
    />
  );
}
