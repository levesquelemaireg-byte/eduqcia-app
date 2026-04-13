"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { loginSchema } from "@/lib/schemas/auth";
import type { AuthErrorCode } from "@/lib/actions/auth-errors";
import { authErrorMessages } from "@/lib/actions/auth-errors";

const MSG = authErrorMessages;

/** Payload strictement sérialisable (évite « 1 item not stringified » dans les logs Next). */
export type LoginPayload = {
  email: string;
  password: string;
  next: string;
};

/**
 * Connexion — retourne `redirectTo` pour navigation pleine page côté client (cookies session).
 */
export async function loginAction(
  payload: unknown,
): Promise<{ ok: true; redirectTo: string } | { error: { code: AuthErrorCode; message: string } }> {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: { code: "validation", message: MSG.validation } };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  const nextRaw =
    typeof payload === "object" &&
    payload !== null &&
    "next" in payload &&
    typeof (payload as { next: unknown }).next === "string"
      ? (payload as { next: string }).next
      : "/dashboard";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  const supabase = await createClient();
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !authData.user) {
    const errMsg = signInError?.message?.toLowerCase() ?? "";
    if (
      signInError?.code === "email_not_confirmed" ||
      errMsg.includes("email not confirmed") ||
      errMsg.includes("not confirmed")
    ) {
      return {
        error: {
          code: "invalid",
          message:
            "Courriel non confirmé. Ouvrez le lien dans le courriel d’inscription, ou demandez un nouveau lien depuis la page d’activation.",
        },
      };
    }
    return { error: { code: "invalid", message: MSG.invalid } };
  }

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: { code: "inactive", message: MSG.inactive } };
  }

  // Si Supabase a accepté le mot de passe, l'email est confirmé côté auth.
  // Profil encore pending → l'activer automatiquement (rattrapage si callback a échoué).
  if (profile.status === "pending") {
    const { error: activateError } = await admin
      .from("profiles")
      .update({ status: "active", activated_at: new Date().toISOString(), activation_token: null })
      .eq("id", authData.user.id);
    if (activateError) {
      console.error("[login] auto-activation failed:", activateError.message);
      await supabase.auth.signOut();
      return { error: { code: "inactive", message: MSG.inactive } };
    }
  }

  if (profile.status === "suspended") {
    await supabase.auth.signOut();
    return { error: { code: "inactive", message: MSG.inactive } };
  }

  return { ok: true, redirectTo: next };
}
