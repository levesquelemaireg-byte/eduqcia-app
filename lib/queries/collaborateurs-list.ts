import type { SupabaseClient } from "@supabase/supabase-js";

export type CollaborateurListRow = {
  id: string;
  full_name: string;
  email: string;
  school: string | null;
  tae_published_count: number;
};

/**
 * Tous les profils actifs (hors utilisateur courant) avec le nombre de TAÉ publiées.
 * Tri alphabétique par nom.
 */
export async function getAllActiveCollaborateurs(
  supabase: SupabaseClient,
  currentUserId: string,
): Promise<CollaborateurListRow[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, school")
    .eq("status", "active")
    .neq("id", currentUserId)
    .order("full_name", { ascending: true });

  if (error || !profiles) return [];

  // Compter les TAÉ publiées par auteur en une seule requête
  const userIds = profiles.map((p) => p.id);
  if (userIds.length === 0) return [];

  const { data: counts } = await supabase
    .from("tae")
    .select("auteur_id")
    .in("auteur_id", userIds)
    .eq("is_published", true);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.auteur_id, (countMap.get(row.auteur_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    id: p.id as string,
    full_name: p.full_name as string,
    email: p.email as string,
    school: p.school as string | null,
    tae_published_count: countMap.get(p.id as string) ?? 0,
  }));
}
