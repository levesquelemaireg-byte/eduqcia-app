import { notFound } from "next/navigation";
import { FicheRetourLink } from "@/components/tae/fiche/FicheRetourLink";
import { SectionVotes } from "@/components/tae/fiche/SectionVotes";
import { FicheLecture } from "@/components/tae/FicheLecture";
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

  const canVote = Boolean(user?.id && bundle.fiche.auteur_id !== user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <FicheRetourLink />
      <FicheLecture tae={bundle.fiche} userId={user?.id} />
      <div className="mt-6 min-w-0 rounded-2xl border border-border bg-panel px-5 py-4 shadow-sm">
        <SectionVotes taeId={bundle.fiche.id} votes={bundle.votes} canVote={canVote} />
      </div>
    </div>
  );
}
