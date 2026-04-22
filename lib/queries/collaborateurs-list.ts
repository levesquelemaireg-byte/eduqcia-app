import type { SupabaseClient } from "@supabase/supabase-js";
import { getSortKey } from "@/lib/utils/profile-display";

export type CollaborateurListRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  genre: string | null;
  schoolName: string | null;
  cssName: string | null;
  docCount: number;
  taskCount: number;
  evalCount: number;
  disciplines: string[];
  niveaux: string[];
};

/**
 * Tous les profils actifs (hors utilisateur courant) avec compteurs + pivot data.
 * Tri alphabétique par nom de famille.
 */
export async function getAllActiveCollaborateurs(
  supabase: SupabaseClient,
  currentUserId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ items: CollaborateurListRow[]; total: number }> {
  // Total count
  const { count: totalCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .neq("id", currentUserId);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, role, genre, schools(nom_officiel, css:css(nom_officiel))",
    )
    .eq("status", "active")
    .neq("id", currentUserId)
    .order("last_name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !profiles) return { items: [], total: 0 };

  const userIds = profiles.map((p) => p.id);
  if (userIds.length === 0) return { items: [], total: totalCount ?? 0 };

  // Charger compteurs + pivot data en parallèle
  const [
    { data: taskCounts },
    { data: docCounts },
    { data: evalCounts },
    { data: allDisciplines },
    { data: allNiveaux },
  ] = await Promise.all([
    supabase.from("tache").select("auteur_id").in("auteur_id", userIds).eq("is_published", true),
    supabase
      .from("documents")
      .select("auteur_id")
      .in("auteur_id", userIds)
      .eq("is_published", true),
    supabase
      .from("evaluations")
      .select("auteur_id")
      .in("auteur_id", userIds)
      .eq("is_published", true),
    supabase
      .from("profile_disciplines")
      .select("profile_id, discipline_code")
      .in("profile_id", userIds),
    supabase.from("profile_niveaux").select("profile_id, niveau_code").in("profile_id", userIds),
  ]);

  function buildCountMap(rows: { auteur_id: string }[] | null): Map<string, number> {
    const m = new Map<string, number>();
    for (const r of rows ?? []) {
      m.set(r.auteur_id, (m.get(r.auteur_id) ?? 0) + 1);
    }
    return m;
  }

  const taskMap = buildCountMap(taskCounts);
  const docMap = buildCountMap(docCounts);
  const evalMap = buildCountMap(evalCounts);

  const discMap = new Map<string, string[]>();
  for (const d of allDisciplines ?? []) {
    const arr = discMap.get(d.profile_id) ?? [];
    arr.push(d.discipline_code);
    discMap.set(d.profile_id, arr);
  }

  const nivMap = new Map<string, string[]>();
  for (const n of allNiveaux ?? []) {
    const arr = nivMap.get(n.profile_id) ?? [];
    arr.push(n.niveau_code);
    nivMap.set(n.profile_id, arr);
  }

  type RawProfile = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    genre: string | null;
    schools: { nom_officiel: string; css: { nom_officiel: string } | null } | null;
  };

  const items = (profiles as unknown as RawProfile[])
    .map((p) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      role: p.role,
      genre: p.genre ?? null,
      schoolName: p.schools?.nom_officiel ?? null,
      cssName: p.schools?.css?.nom_officiel ?? null,
      docCount: docMap.get(p.id) ?? 0,
      taskCount: taskMap.get(p.id) ?? 0,
      evalCount: evalMap.get(p.id) ?? 0,
      disciplines: discMap.get(p.id) ?? [],
      niveaux: nivMap.get(p.id) ?? [],
    }))
    .sort((a, b) =>
      getSortKey(a.firstName, a.lastName).localeCompare(
        getSortKey(b.firstName, b.lastName),
        "fr-CA",
      ),
    );

  return { items, total: totalCount ?? 0 };
}
