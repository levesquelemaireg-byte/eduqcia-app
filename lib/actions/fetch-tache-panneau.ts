"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchTaeFicheBundle } from "@/lib/tae/server-fiche-map";
import type { TaeFicheData, PeerVoteTally } from "@/lib/types/fiche";

type FetchResult =
  | { ok: true; data: { fiche: TaeFicheData; votes: PeerVoteTally | null } }
  | { ok: false; error: "auth" | "not_found" };

/**
 * Server Action — fetch TaeFicheData pour une tâche par ID.
 * Utilisée par le panneau latéral tâche (vue détaillée épreuve).
 */
export async function fetchTachePanneauAction(taeId: string): Promise<FetchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const bundle = await fetchTaeFicheBundle(supabase, taeId);
  if (!bundle) return { ok: false, error: "not_found" };

  return { ok: true, data: bundle };
}
