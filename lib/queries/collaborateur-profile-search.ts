import type { SupabaseClient } from "@supabase/supabase-js";

export type CollaborateurProfileSearchRow = {
  id: string;
  full_name: string;
  email: string;
  school: string | null;
};

const LIMIT_EACH = 12;
const LIMIT_MERGED = 20;

function profilesSearchQuery(supabase: SupabaseClient, excludeUserId: string) {
  return supabase
    .from("profiles")
    .select("id, full_name, email, school")
    .eq("status", "active")
    .neq("id", excludeUserId);
}

/**
 * Profils actifs correspondant au terme (nom, courriel, établissement) — hors utilisateur courant.
 * Trois requêtes `ilike` pour éviter les pièges d’échappement PostgREST sur `or()`.
 */
export async function searchCollaborateurProfiles(
  supabase: SupabaseClient,
  params: { excludeUserId: string; term: string },
): Promise<CollaborateurProfileSearchRow[]> {
  const pattern = `%${params.term}%`;

  const [byName, byEmail, bySchool] = await Promise.all([
    profilesSearchQuery(supabase, params.excludeUserId)
      .ilike("full_name", pattern)
      .limit(LIMIT_EACH),
    profilesSearchQuery(supabase, params.excludeUserId).ilike("email", pattern).limit(LIMIT_EACH),
    profilesSearchQuery(supabase, params.excludeUserId).ilike("school", pattern).limit(LIMIT_EACH),
  ]);

  if (byName.error || byEmail.error || bySchool.error) return [];

  const merged = new Map<string, CollaborateurProfileSearchRow>();
  const pushRows = (rows: CollaborateurProfileSearchRow[] | null) => {
    for (const row of rows ?? []) {
      if (!row.id || merged.has(row.id)) continue;
      merged.set(row.id, row);
    }
  };

  pushRows(byName.data as CollaborateurProfileSearchRow[]);
  pushRows(byEmail.data as CollaborateurProfileSearchRow[]);
  pushRows(bySchool.data as CollaborateurProfileSearchRow[]);

  return [...merged.values()]
    .sort((a, b) => a.full_name.localeCompare(b.full_name, "fr-CA"))
    .slice(0, LIMIT_MERGED);
}
