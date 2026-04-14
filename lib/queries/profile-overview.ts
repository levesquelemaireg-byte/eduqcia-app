import type { SupabaseClient } from "@supabase/supabase-js";
import { type ExperienceLevel, getExperienceLevel } from "@/components/ui/ExperienceBadge";

export type ProfileOverview = {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "enseignant" | "conseiller_pedagogique" | "admin";
    schoolName: string | null;
    cssName: string | null;
    disciplines: string[];
    niveaux: string[];
    yearsExperience: number | null;
    createdAt: string;
    status: string;
  };
  counts: {
    documents: number;
    tasks: number;
    evaluations: number;
    total: number;
  };
  experienceLabel: ExperienceLevel;
  missingProInfoCount: number;
  isOwner: boolean;
};

/**
 * Query agrégée unique pour le profil — élimine N+1 (§19.2).
 * Retourne null si profil introuvable ou désactivé (sauf admin).
 */
export async function fetchProfileOverview(
  supabase: SupabaseClient,
  profileId: string,
  currentUserId: string | null,
): Promise<ProfileOverview | null> {
  // 1. Profil de base avec école/CSS
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, role, status, school_id, years_experience, created_at, schools(nom_officiel, css:css(nom_officiel))",
    )
    .eq("id", profileId)
    .maybeSingle();

  if (error || !profile) return null;

  // Vérifier que le profil est actif (sauf pour les admins)
  if (profile.status !== "active" && profile.status !== "suspended") return null;

  type SchoolJoin = { nom_officiel: string; css: { nom_officiel: string } | null } | null;
  const school = profile.schools as unknown as SchoolJoin;

  // 2. Disciplines et niveaux du profil (pivot tables)
  const [{ data: disciplines }, { data: niveaux }] = await Promise.all([
    supabase.from("profile_disciplines").select("discipline_code").eq("profile_id", profileId),
    supabase.from("profile_niveaux").select("niveau_code").eq("profile_id", profileId),
  ]);

  // 3. Compteurs de contributions publiées
  const [{ count: docCount }, { count: taskCount }, { count: evalCount }] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("auteur_id", profileId)
      .eq("is_published", true),
    supabase
      .from("tae")
      .select("id", { count: "exact", head: true })
      .eq("auteur_id", profileId)
      .eq("is_published", true),
    supabase
      .from("evaluations")
      .select("id", { count: "exact", head: true })
      .eq("auteur_id", profileId)
      .eq("is_published", true),
  ]);

  const documents = docCount ?? 0;
  const tasks = taskCount ?? 0;
  const evaluations = evalCount ?? 0;
  const total = documents + tasks + evaluations;

  const disciplinesList = (disciplines ?? []).map((d) => d.discipline_code);
  const niveauxList = (niveaux ?? []).map((n) => n.niveau_code);

  // Calcul du nombre d'infos pro manquantes (max 3)
  let missingProInfoCount = 0;
  if (disciplinesList.length === 0) missingProInfoCount++;
  if (niveauxList.length === 0) missingProInfoCount++;
  if (profile.years_experience == null) missingProInfoCount++;

  return {
    profile: {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      role: profile.role,
      schoolName: school?.nom_officiel ?? null,
      cssName: school?.css?.nom_officiel ?? null,
      disciplines: disciplinesList,
      niveaux: niveauxList,
      yearsExperience: profile.years_experience,
      createdAt: profile.created_at,
      status: profile.status,
    },
    counts: { documents, tasks, evaluations, total },
    experienceLabel: getExperienceLevel(total),
    missingProInfoCount,
    isOwner: currentUserId === profileId,
  };
}
