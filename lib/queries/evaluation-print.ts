import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchTaeFicheBundle } from "@/lib/tae/server-fiche-map";
import type { TaeFicheData } from "@/lib/types/fiche";

export type EvaluationPrintBundle = {
  evaluationId: string;
  titre: string;
  fiches: TaeFicheData[];
};

/**
 * Données pour `/evaluations/[id]/print` (épreuve) — auteur uniquement, non archivée.
 */
export async function fetchEvaluationPrintBundle(
  supabase: SupabaseClient,
  evaluationId: string,
  userId: string,
): Promise<EvaluationPrintBundle | null> {
  const { data: ev, error: evErr } = await supabase
    .from("evaluations")
    .select("id, titre, auteur_id, is_archived")
    .eq("id", evaluationId)
    .maybeSingle();

  if (evErr || !ev || ev.is_archived || ev.auteur_id !== userId) return null;

  const { data: links, error: linkErr } = await supabase
    .from("evaluation_tae")
    .select("tae_id")
    .eq("evaluation_id", evaluationId)
    .order("ordre", { ascending: true });

  if (linkErr) return null;

  const taeIds = (links ?? []).map((l) => l.tae_id as string);
  const fiches: TaeFicheData[] = [];

  for (const taeId of taeIds) {
    const bundle = await fetchTaeFicheBundle(supabase, taeId);
    if (!bundle) return null;
    fiches.push(bundle.fiche);
  }

  return {
    evaluationId: ev.id,
    titre: ev.titre,
    fiches,
  };
}
