import "server-only";

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { fetchTacheFicheBundle } from "@/lib/tache/server-fiche-map";
import { ficheTaVersDonneesTache } from "@/lib/tache/contrats/fiche-vers-donnees-tache";
import type { GrilleEvaluationEntree } from "@/lib/tache/contrats/etat-wizard-vers-tache";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";

export type EvaluationDetailBundle = {
  donnees: DonneesEpreuve;
  estAuteur: boolean;
  estPubliee: boolean;
  auteurNom: string;
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

/**
 * Charge les données complètes d'une épreuve pour la vue détaillée.
 * Fetch évaluation + tâches liées → DonneesEpreuve.
 */
export async function getEvaluationDetailBundle(
  evaluationId: string,
): Promise<EvaluationDetailBundle | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Fetch évaluation
  const { data: ev, error: evErr } = await supabase
    .from("evaluations")
    .select("id, titre, auteur_id, is_published")
    .eq("id", evaluationId)
    .maybeSingle();

  if (evErr || !ev) return null;

  const estAuteur = user.id === ev.auteur_id;

  // 2. Fetch auteur
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", ev.auteur_id as string)
    .maybeSingle();

  const auteurNom =
    profileRow && "first_name" in profileRow
      ? `${String(profileRow.first_name ?? "")} ${String(profileRow.last_name ?? "")}`.trim()
      : "";

  // 3. Fetch tâches liées (ordonnées)
  const { data: links, error: linkErr } = await supabase
    .from("evaluation_tae")
    .select("tae_id")
    .eq("evaluation_id", evaluationId)
    .order("ordre", { ascending: true });

  if (linkErr) return null;

  const tacheIds = (links ?? []).map((l) => l.tae_id as string);

  // 4. Convertir chaque tâche TacheFicheData → DonneesTache
  const grilles = chargerGrilles();
  const taches: DonneesTache[] = [];

  for (const tacheId of tacheIds) {
    const bundle = await fetchTacheFicheBundle(supabase, tacheId);
    if (!bundle) continue; // skip broken links
    taches.push(ficheTaVersDonneesTache(bundle.fiche, grilles));
  }

  // 5. Assembler DonneesEpreuve
  const donnees: DonneesEpreuve = {
    id: ev.id as string,
    titre: ev.titre as string,
    enTete: {
      titre: ev.titre as string,
      enseignant: auteurNom,
    },
    taches,
  };

  return {
    donnees,
    estAuteur,
    estPubliee: (ev.is_published as boolean) ?? false,
    auteurNom,
  };
}
