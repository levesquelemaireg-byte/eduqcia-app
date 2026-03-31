"use server";

import { createClient } from "@/lib/supabase/server";
import {
  rawCollaborateurSearchSchema,
  sanitizeCollaborateurSearchTerm,
} from "@/lib/schemas/collaborateur-search";
import {
  searchCollaborateurProfiles,
  type CollaborateurProfileSearchRow,
} from "@/lib/queries/collaborateur-profile-search";

export type SearchCollaborateursProfilesResult =
  | { ok: true; rows: CollaborateurProfileSearchRow[] }
  | { ok: false };

/**
 * Recherche enseignants actifs (`profiles`) pour le Bloc 1 du wizard — RLS `profiles_select`.
 */
export async function searchCollaborateursProfilesAction(
  rawQuery: string,
): Promise<SearchCollaborateursProfilesResult> {
  const parsed = rawCollaborateurSearchSchema.safeParse(rawQuery ?? "");
  if (!parsed.success) return { ok: true, rows: [] };

  const term = sanitizeCollaborateurSearchTerm(parsed.data);
  if (term.length < 2) return { ok: true, rows: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const rows = await searchCollaborateurProfiles(supabase, {
    excludeUserId: user.id,
    term,
  });
  return { ok: true, rows };
}
