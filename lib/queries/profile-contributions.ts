import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 10;

// ── Types ────────────────────────────────────────────────────────────

export type ProfileTask = {
  id: string;
  consigne: string | null;
  oiTitre: string | null;
  comportementEnonce: string | null;
  niveauLabel: string | null;
  disciplineLabel: string | null;
  createdAt: string;
  usageCount: number;
};

export type ProfileEvaluation = {
  id: string;
  titre: string;
  tacheCount: number;
  createdAt: string;
};

// ── Tâches (avec usage_count via sous-query) ────────────────────────

export async function fetchProfileTasks(
  supabase: SupabaseClient,
  auteurId: string,
  offset: number = 0,
): Promise<ProfileTask[]> {
  const { data, error } = await supabase
    .from("tae")
    .select(
      "id, consigne, created_at, oi:oi_id(titre), comportement:comportement_id(enonce), niveau:niveau_id(label), discipline:discipline_id(label)",
    )
    .eq("auteur_id", auteurId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error || !data) return [];

  // Charger les usage_count pour les IDs retournés
  const tacheIds = data.map((t) => t.id);
  const { data: usages } = await supabase
    .from("tae_usages")
    .select("tae_id")
    .in("tae_id", tacheIds);

  const usageMap = new Map<string, number>();
  for (const u of usages ?? []) {
    usageMap.set(u.tae_id, (usageMap.get(u.tae_id) ?? 0) + 1);
  }

  type JoinRow = {
    id: string;
    consigne: string | null;
    created_at: string;
    oi: { titre: string } | null;
    comportement: { enonce: string } | null;
    niveau: { label: string } | null;
    discipline: { label: string } | null;
  };

  return (data as unknown as JoinRow[]).map((t) => ({
    id: t.id,
    consigne: t.consigne,
    oiTitre: t.oi?.titre ?? null,
    comportementEnonce: t.comportement?.enonce ?? null,
    niveauLabel: t.niveau?.label ?? null,
    disciplineLabel: t.discipline?.label ?? null,
    createdAt: t.created_at,
    usageCount: usageMap.get(t.id) ?? 0,
  }));
}

// ── Épreuves ─────────────────────────────────────────────────────────

export async function fetchProfileEvaluations(
  supabase: SupabaseClient,
  auteurId: string,
  offset: number = 0,
): Promise<ProfileEvaluation[]> {
  const { data, error } = await supabase
    .from("evaluations")
    .select("id, titre, created_at, evaluation_tae(count)")
    .eq("auteur_id", auteurId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error || !data) return [];

  type EvalRow = {
    id: string;
    titre: string;
    created_at: string;
    evaluation_tae: { count: number }[];
  };

  return (data as unknown as EvalRow[]).map((e) => ({
    id: e.id,
    titre: e.titre,
    tacheCount: e.evaluation_tae?.[0]?.count ?? 0,
    createdAt: e.created_at,
  }));
}
