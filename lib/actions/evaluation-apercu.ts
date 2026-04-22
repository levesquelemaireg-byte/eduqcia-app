"use server";

import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";
import { createClient } from "@/lib/supabase/server";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { fetchTacheFicheBundle } from "@/lib/tache/server-fiche-map";
import { ficheTaVersDonneesTache } from "@/lib/tache/contrats/fiche-vers-donnees-tache";
import { signerTokenDraft } from "@/lib/epreuve/impression/token-draft";
import type { GrilleEvaluationEntree } from "@/lib/tache/contrats/etat-wizard-vers-tache";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";

const KV_TTL_SECONDS = 10 * 60;

/** Cache module — un seul chargement par instance serveur. */
let grillesCache: GrilleEvaluationEntree[] | null = null;

function chargerGrilles(): GrilleEvaluationEntree[] {
  if (grillesCache) return grillesCache;
  const filePath = path.join(process.cwd(), "public/data/grilles-evaluation.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  grillesCache = JSON.parse(raw) as GrilleEvaluationEntree[];
  return grillesCache;
}

export type GenererTokenResult = { ok: true; token: string } | { ok: false; error: string };

/**
 * Génère un token d'aperçu impression pour une épreuve publiée/brouillon.
 *
 * 1. Fetch évaluation + tâches liées depuis Supabase
 * 2. Convertit chaque TacheFicheData → DonneesTache
 * 3. Construit DonneesEpreuve, stocke dans Vercel KV
 * 4. Retourne le token HMAC signé
 */
export async function genererTokenApercuEpreuve(evaluationId: string): Promise<GenererTokenResult> {
  const user = await requireActiveAppUser();
  const supabase = await createClient();

  // 1. Fetch évaluation
  const { data: ev, error: evErr } = await supabase
    .from("evaluations")
    .select("id, titre, auteur_id")
    .eq("id", evaluationId)
    .maybeSingle();

  if (evErr || !ev) {
    return { ok: false, error: "Épreuve introuvable." };
  }

  // 2. Fetch tâches liées (ordonnées)
  const { data: links, error: linkErr } = await supabase
    .from("evaluation_tache")
    .select("tae_id")
    .eq("evaluation_id", evaluationId)
    .order("ordre", { ascending: true });

  if (linkErr) {
    return { ok: false, error: "Erreur lors du chargement des tâches." };
  }

  const tacheIds = (links ?? []).map((l) => l.tae_id as string);

  // 3. Convertir chaque tâche (en parallèle)
  const grilles = chargerGrilles();

  const bundles = await Promise.all(tacheIds.map((id) => fetchTacheFicheBundle(supabase, id)));
  const missing = tacheIds.find((_, i) => !bundles[i]);
  if (missing) {
    return { ok: false, error: `Tâche introuvable (${missing}).` };
  }

  const taches: DonneesTache[] = bundles.map((b) => ficheTaVersDonneesTache(b!.fiche, grilles));

  // 4. Construire DonneesEpreuve
  const epreuve: DonneesEpreuve = {
    id: ev.id as string,
    titre: ev.titre as string,
    enTete: {
      titre: ev.titre as string,
      enseignant: `${user.firstName} ${user.lastName}`.trim(),
    },
    taches,
  };

  // 5. Stocker dans KV + signer
  const kvValue = JSON.stringify({
    type: "epreuve",
    payload: epreuve,
    mode: "formatif",
    estCorrige: false,
  });

  const payloadId = crypto.randomUUID();
  await kv.set(`draft:${payloadId}`, kvValue, { ex: KV_TTL_SECONDS });

  const token = signerTokenDraft(payloadId);
  return { ok: true, token };
}
