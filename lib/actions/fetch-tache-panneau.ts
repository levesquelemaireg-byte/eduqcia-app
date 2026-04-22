"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchTacheFicheBundle } from "@/lib/tache/server-fiche-map";
import type { TacheFicheData, PeerVoteTally } from "@/lib/types/fiche";

type FetchResult =
  | { ok: true; data: { fiche: TacheFicheData; votes: PeerVoteTally | null } }
  | { ok: false; error: "auth" | "not_found" };

/**
 * Server Action — fetch TacheFicheData pour une tâche par ID.
 * Utilisée par le panneau latéral tâche (vue détaillée épreuve).
 */
export async function fetchTachePanneauAction(tacheId: string): Promise<FetchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const bundle = await fetchTacheFicheBundle(supabase, tacheId);
  if (!bundle) return { ok: false, error: "not_found" };

  return { ok: true, data: bundle };
}
