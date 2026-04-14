import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Nombre d'infos professionnelles manquantes (max 3).
 * Alimente le badge notification sidebar (§13).
 */
export async function getMissingProInfoCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const [{ data: profile }, { count: discCount }, { count: nivCount }] = await Promise.all([
    supabase.from("profiles").select("years_experience").eq("id", userId).maybeSingle(),
    supabase
      .from("profile_disciplines")
      .select("discipline_code", { count: "exact", head: true })
      .eq("profile_id", userId),
    supabase
      .from("profile_niveaux")
      .select("niveau_code", { count: "exact", head: true })
      .eq("profile_id", userId),
  ]);

  let missing = 0;
  if (!discCount || discCount === 0) missing++;
  if (!nivCount || nivCount === 0) missing++;
  if (profile?.years_experience == null) missing++;
  return missing;
}
