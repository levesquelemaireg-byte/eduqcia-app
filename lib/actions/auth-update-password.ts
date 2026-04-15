"use server";

import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/schemas/profile";

type Result = { success: true } | { success: false; error: string };

/**
 * Changement de mot de passe (AUTH-1).
 * Re-authentifie d'abord avec le mot de passe actuel,
 * puis applique le nouveau via `auth.updateUser`.
 */
export async function updatePasswordAction(payload: unknown): Promise<Result> {
  const user = await requireActiveAppUser();

  const parsed = changePasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  const { currentPassword, newPassword } = parsed.data;

  const supabase = await createClient();

  // Re-authenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Mot de passe actuel incorrect." };
  }

  // Apply new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("[updatePasswordAction]", updateError);
    return { success: false, error: "Erreur lors du changement de mot de passe. Réessayez." };
  }

  return { success: true };
}
