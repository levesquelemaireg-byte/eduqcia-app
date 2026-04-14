"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccountSchema } from "@/lib/schemas/profile";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Server Action — suppression de compte Loi 25 (§17.5). */
export async function deleteAccountAction(payload: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const parsed = deleteAccountSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Confirmation invalide." };

  const { error } = await supabase.rpc("delete_account_anonymize", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("[deleteAccountAction]", error);
    return { ok: false, error: "Impossible de supprimer le compte. Réessayez." };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
