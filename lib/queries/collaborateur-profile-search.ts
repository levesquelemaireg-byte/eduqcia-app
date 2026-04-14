import type { SupabaseClient } from "@supabase/supabase-js";
import { getSortKey } from "@/lib/utils/profile-display";

export type CollaborateurProfileSearchRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  school_id: string | null;
};

const LIMIT_EACH = 12;
const LIMIT_MERGED = 20;

function profilesSearchQuery(supabase: SupabaseClient, excludeUserId: string) {
  return supabase
    .from("profiles")
    .select("id, first_name, last_name, email, school_id")
    .eq("status", "active")
    .neq("id", excludeUserId);
}

/**
 * Profils actifs correspondant au terme (prénom, nom, courriel) — hors utilisateur courant.
 * Recherche sur first_name et last_name séparément.
 */
export async function searchCollaborateurProfiles(
  supabase: SupabaseClient,
  params: { excludeUserId: string; term: string },
): Promise<CollaborateurProfileSearchRow[]> {
  const pattern = `%${params.term}%`;

  const [byFirstName, byLastName, byEmail] = await Promise.all([
    profilesSearchQuery(supabase, params.excludeUserId)
      .ilike("first_name", pattern)
      .limit(LIMIT_EACH),
    profilesSearchQuery(supabase, params.excludeUserId)
      .ilike("last_name", pattern)
      .limit(LIMIT_EACH),
    profilesSearchQuery(supabase, params.excludeUserId).ilike("email", pattern).limit(LIMIT_EACH),
  ]);

  if (byFirstName.error || byLastName.error || byEmail.error) return [];

  const merged = new Map<string, CollaborateurProfileSearchRow>();
  const pushRows = (rows: CollaborateurProfileSearchRow[] | null) => {
    for (const row of rows ?? []) {
      if (!row.id || merged.has(row.id)) continue;
      merged.set(row.id, row);
    }
  };

  pushRows(byFirstName.data as CollaborateurProfileSearchRow[]);
  pushRows(byLastName.data as CollaborateurProfileSearchRow[]);
  pushRows(byEmail.data as CollaborateurProfileSearchRow[]);

  return [...merged.values()]
    .sort((a, b) =>
      getSortKey(a.first_name, a.last_name).localeCompare(
        getSortKey(b.first_name, b.last_name),
        "fr-CA",
      ),
    )
    .slice(0, LIMIT_MERGED);
}
