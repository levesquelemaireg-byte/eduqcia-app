import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileOverview } from "@/lib/queries/profile-overview";
import {
  fetchProfileDocuments,
  fetchProfileTasks,
  fetchProfileEvaluations,
} from "@/lib/queries/profile-contributions";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const overview = await fetchProfileOverview(supabase, id, user?.id ?? null);

  if (!overview) notFound();

  // Profil désactivé/supprimé — message minimal
  if (overview.profile.status === "suspended") {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <span
          className="material-symbols-outlined mb-4 text-[48px] text-slate-400"
          aria-hidden="true"
        >
          person_off
        </span>
        <h1 className="text-xl font-semibold text-slate-900">Ce compte a été désactivé.</h1>
        <p className="mt-2 text-sm text-slate-500">
          Les contributions de cet utilisateur restent disponibles dans la banque collaborative.
        </p>
      </div>
    );
  }

  // Charger les 10 premiers items de chaque onglet en parallèle
  const [initialDocuments, initialTasks, initialEvaluations] = await Promise.all([
    fetchProfileDocuments(supabase, id),
    fetchProfileTasks(supabase, id),
    fetchProfileEvaluations(supabase, id),
  ]);

  // Charger les options CSS/écoles pour le Side Sheet identité (seulement si propriétaire)
  let cssOptions: { id: string; nomOfficiel: string }[] = [];
  let schoolOptions: { id: string; nomOfficiel: string; cssId: string }[] = [];

  if (overview.isOwner) {
    const [{ data: cssData }, { data: schoolData }] = await Promise.all([
      supabase.from("css").select("id, nom_officiel").eq("is_active", true).order("nom_officiel"),
      supabase
        .from("schools")
        .select("id, nom_officiel, css_id")
        .eq("is_active", true)
        .order("nom_officiel"),
    ]);

    cssOptions = (cssData ?? []).map((c) => ({ id: c.id, nomOfficiel: c.nom_officiel }));
    schoolOptions = (schoolData ?? []).map((s) => ({
      id: s.id,
      nomOfficiel: s.nom_officiel,
      cssId: s.css_id,
    }));
  }

  return (
    <ProfilePageClient
      overview={overview}
      initialDocuments={initialDocuments}
      initialTasks={initialTasks}
      initialEvaluations={initialEvaluations}
      cssOptions={cssOptions}
      schoolOptions={schoolOptions}
    />
  );
}
