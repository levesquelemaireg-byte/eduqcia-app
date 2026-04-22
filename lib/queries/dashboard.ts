import { createClient } from "@/lib/supabase/server";

function voteLevelToNumber(v: string): number {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 1 && n <= 3 ? n : 0;
}

export type DashboardStats = {
  tachePublished: number;
  evaluationsCount: number;
  unreadNotifications: number;
  favoritesCount: number;
  /** Moyenne 1–3 sur les axes de vote, ou null si aucun vote */
  averageConfidence: number | null;
  /** Nombre total de votes (lignes) sur les TAÉ publiées de l’utilisateur */
  votesCount: number;
  /** Documents historiques non visibles en banque (`is_published` faux, auteur courant) */
  unpublishedDocumentsCount: number;
};

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const [tachePub, evals, notifs, favs, tacheIdsRes, unpublishedDocsRes] = await Promise.all([
    supabase
      .from("tache")
      .select("id", { count: "exact", head: true })
      .eq("auteur_id", userId)
      .eq("is_published", true)
      .eq("is_archived", false),
    supabase
      .from("evaluations")
      .select("id", { count: "exact", head: true })
      .eq("auteur_id", userId)
      .eq("is_archived", false),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
    supabase.from("favoris").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("tache")
      .select("id")
      .eq("auteur_id", userId)
      .eq("is_published", true)
      .eq("is_archived", false),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("auteur_id", userId)
      .eq("is_published", false),
  ]);

  const tacheIds = (tacheIdsRes.data ?? []).map((r) => r.id);
  let averageConfidence: number | null = null;
  let votesCount = 0;

  if (tacheIds.length > 0) {
    const { data: voteRows } = await supabase
      .from("votes")
      .select("rigueur_historique, clarte_consigne, alignement_ministeriel")
      .in("tae_id", tacheIds);

    if (voteRows?.length) {
      votesCount = voteRows.length;
      const nums: number[] = [];
      for (const v of voteRows) {
        nums.push(
          voteLevelToNumber(v.rigueur_historique),
          voteLevelToNumber(v.clarte_consigne),
          voteLevelToNumber(v.alignement_ministeriel),
        );
      }
      const valid = nums.filter((n) => n > 0);
      if (valid.length > 0) {
        averageConfidence = valid.reduce((a, b) => a + b, 0) / valid.length;
      }
    }
  }

  return {
    tachePublished: tachePub.count ?? 0,
    evaluationsCount: evals.count ?? 0,
    unreadNotifications: notifs.count ?? 0,
    favoritesCount: favs.count ?? 0,
    averageConfidence,
    votesCount,
    unpublishedDocumentsCount: unpublishedDocsRes.count ?? 0,
  };
}
