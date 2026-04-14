"use server";

import { revalidatePath } from "next/cache";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { createClient } from "@/lib/supabase/server";
import { profileProfessionalSchema } from "@/lib/schemas/profile";

type ActionResult = { success: true } | { success: false; error: string };

/** Server Action — mise à jour infos professionnelles avec diff intelligent (§9.5). */
export async function updateProfileProfessional(payload: unknown): Promise<ActionResult> {
  const user = await requireActiveAppUser();

  const parsed = profileProfessionalSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  const { niveaux, disciplines, yearsExperience } = parsed.data;
  const supabase = await createClient();

  // 1. Mettre à jour years_experience
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ years_experience: yearsExperience })
    .eq("id", user.userId);

  if (profileError) {
    console.error("[updateProfileProfessional] profile update", profileError);
    return { success: false, error: "Impossible d'enregistrer les modifications. Réessayez." };
  }

  // 2. Diff intelligent sur les disciplines
  const { data: oldDisciplines } = await supabase
    .from("profile_disciplines")
    .select("discipline_code")
    .eq("profile_id", user.userId);

  const oldDisciplineCodes = (oldDisciplines ?? []).map((d) => d.discipline_code);
  const disciplinesToAdd = disciplines.filter((d) => !oldDisciplineCodes.includes(d));
  const disciplinesToRemove = oldDisciplineCodes.filter((d) => !disciplines.includes(d));

  if (disciplinesToRemove.length > 0) {
    const { error } = await supabase
      .from("profile_disciplines")
      .delete()
      .eq("profile_id", user.userId)
      .in("discipline_code", disciplinesToRemove);
    if (error) {
      console.error("[updateProfileProfessional] delete disciplines", error);
      return { success: false, error: "Impossible d'enregistrer les modifications. Réessayez." };
    }
  }

  if (disciplinesToAdd.length > 0) {
    const { error } = await supabase
      .from("profile_disciplines")
      .insert(disciplinesToAdd.map((code) => ({ profile_id: user.userId, discipline_code: code })));
    if (error) {
      console.error("[updateProfileProfessional] insert disciplines", error);
      return { success: false, error: "Impossible d'enregistrer les modifications. Réessayez." };
    }
  }

  // 3. Diff intelligent sur les niveaux
  const { data: oldNiveaux } = await supabase
    .from("profile_niveaux")
    .select("niveau_code")
    .eq("profile_id", user.userId);

  const oldNiveauCodes = (oldNiveaux ?? []).map((n) => n.niveau_code);
  const niveauxToAdd = niveaux.filter((n) => !oldNiveauCodes.includes(n));
  const niveauxToRemove = oldNiveauCodes.filter((n) => !niveaux.includes(n));

  if (niveauxToRemove.length > 0) {
    const { error } = await supabase
      .from("profile_niveaux")
      .delete()
      .eq("profile_id", user.userId)
      .in("niveau_code", niveauxToRemove);
    if (error) {
      console.error("[updateProfileProfessional] delete niveaux", error);
      return { success: false, error: "Impossible d'enregistrer les modifications. Réessayez." };
    }
  }

  if (niveauxToAdd.length > 0) {
    const { error } = await supabase
      .from("profile_niveaux")
      .insert(niveauxToAdd.map((code) => ({ profile_id: user.userId, niveau_code: code })));
    if (error) {
      console.error("[updateProfileProfessional] insert niveaux", error);
      return { success: false, error: "Impossible d'enregistrer les modifications. Réessayez." };
    }
  }

  revalidatePath(`/profile/${user.profileId}`);
  return { success: true };
}
