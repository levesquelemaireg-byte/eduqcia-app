import type { SupabaseClient } from "@supabase/supabase-js";
import { getSortKey } from "@/lib/utils/profile-display";

export type CollaborateurListRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  school_id: string | null;
  school_name: string | null;
  css_name: string | null;
  tae_published_count: number;
};

/**
 * Tous les profils actifs (hors utilisateur courant) avec le nombre de TAÉ publiées.
 * Tri alphabétique par nom de famille.
 */
export async function getAllActiveCollaborateurs(
  supabase: SupabaseClient,
  currentUserId: string,
): Promise<CollaborateurListRow[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, school_id, schools(nom_officiel, css:css(nom_officiel))",
    )
    .eq("status", "active")
    .neq("id", currentUserId)
    .order("last_name", { ascending: true });

  if (error || !profiles) return [];

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

  type RawProfile = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    school_id: string | null;
    schools: { nom_officiel: string; css: { nom_officiel: string } | null } | null;
  };

  return (profiles as unknown as RawProfile[])
    .map((p) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      school_id: p.school_id,
      school_name: p.schools?.nom_officiel ?? null,
      css_name: p.schools?.css?.nom_officiel ?? null,
      tae_published_count: countMap.get(p.id) ?? 0,
    }))
    .sort((a, b) =>
      getSortKey(a.first_name, a.last_name).localeCompare(
        getSortKey(b.first_name, b.last_name),
        "fr-CA",
      ),
    );
}
