import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route handler exception pour la recherche collaborateurs (§19.1).
 * Server Actions ne supportent pas AbortController — route handler nécessaire.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const currentUserId = searchParams.get("userId") ?? "";
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 50));

  if (!currentUserId) {
    return NextResponse.json({ items: [], total: 0 }, { status: 400 });
  }

  const supabase = await createClient();

  // Recherche sur first_name, last_name, email, nom école, nom CSS
  let q = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, role, genre, schools(nom_officiel, css:css(nom_officiel))",
      { count: "exact" },
    )
    .eq("status", "active")
    .neq("id", currentUserId);

  if (query.trim()) {
    // Recherche combinée — ilike sur les champs texte du profil
    const term = `%${query.trim()}%`;
    q = q.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`);
  }

  const {
    data: profiles,
    count,
    error,
  } = await q.order("last_name", { ascending: true }).range(offset, offset + limit - 1);

  if (error || !profiles) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const userIds = profiles.map((p) => p.id);

  // Charger compteurs + pivot data en parallèle
  const [
    { data: taskCounts },
    { data: docCounts },
    { data: evalCounts },
    { data: allDisciplines },
    { data: allNiveaux },
  ] = await Promise.all([
    supabase.from("tae").select("auteur_id").in("auteur_id", userIds).eq("is_published", true),
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

  const items = (profiles as unknown as RawProfile[]).map((p) => ({
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
  }));

  return NextResponse.json({ items, total: count ?? 0 });
}
