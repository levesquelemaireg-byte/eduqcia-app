"use server";

import { revalidatePath } from "next/cache";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { createClient } from "@/lib/supabase/server";
import { profileIdentitySchema } from "@/lib/schemas/profile";

type ActionResult = { success: true } | { success: false; error: string };

/** Server Action — mise à jour identité profil (§9.2). */
export async function updateProfileIdentity(payload: unknown): Promise<ActionResult> {
  const user = await requireActiveAppUser();

  const parsed = profileIdentitySchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  const { firstName, lastName, schoolId } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      school_id: schoolId,
    })
    .eq("id", user.userId);

  if (error) {
    console.error("[updateProfileIdentity]", error);
    return { success: false, error: "Impossible d'enregistrer les modifications. Réessayez." };
  }

  revalidatePath(`/profile/${user.profileId}`);
  return { success: true };
}
