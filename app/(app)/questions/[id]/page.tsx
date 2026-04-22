import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { TacheVueDetaillee } from "@/components/tache/vue-detaillee";
import { createClient } from "@/lib/supabase/server";
import { fetchTaeFicheBundle } from "@/lib/tache/server-fiche-map";
import { ficheTaVersDonneesTache } from "@/lib/tache/contrats/fiche-vers-donnees-tache";
import type { GrilleEvaluationEntree } from "@/lib/tache/contrats/etat-wizard-vers-tache";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Cache module — un seul chargement par instance serveur. */
let grillesCache: GrilleEvaluationEntree[] | null = null;

function chargerGrilles(): GrilleEvaluationEntree[] {
  if (grillesCache) return grillesCache;
  const filePath = path.join(process.cwd(), "public/data/grilles-evaluation.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  grillesCache = JSON.parse(raw) as GrilleEvaluationEntree[];
  return grillesCache;
}

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
  const donneesTache = ficheTaVersDonneesTache(bundle.fiche, chargerGrilles());

  return (
    <TacheVueDetaillee
      tae={bundle.fiche}
      donneesTache={donneesTache}
      votes={bundle.votes}
      peutVoter={peutVoter}
      estAuteur={estAuteur}
    />
  );
}
