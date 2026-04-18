import { notFound } from "next/navigation";
import { EpreuveVueDetaillee } from "@/components/epreuve/vue-detaillee";
import { getEvaluationDetailBundle } from "@/lib/queries/evaluation-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EvaluationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getEvaluationDetailBundle(id);
  if (!bundle) notFound();

  return (
    <EpreuveVueDetaillee
      donnees={bundle.donnees}
      estAuteur={bundle.estAuteur}
      estPubliee={bundle.estPubliee}
      auteurNom={bundle.auteurNom}
    />
  );
}
