import { notFound } from "next/navigation";
import { TacheVueDetaillee } from "@/components/tache/vue-detaillee";
import { createClient } from "@/lib/supabase/server";
import { fetchTaeFicheBundle } from "@/lib/tae/server-fiche-map";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const bundle = await fetchTaeFicheBundle(supabase, id);
  if (!bundle) notFound();

  const peutVoter = Boolean(user?.id && bundle.fiche.auteur_id !== user.id);
  const estAuteur = user?.id === bundle.fiche.auteur_id;

  return (
    <TacheVueDetaillee
      tae={bundle.fiche}
      votes={bundle.votes}
      peutVoter={peutVoter}
      estAuteur={estAuteur}
    />
  );
}
