"use server";

import { createClient } from "@/lib/supabase/server";
import { resendActivationEmailSchema } from "@/lib/schemas/auth";
import type { AuthErrorCode } from "@/lib/actions/auth-errors";
import { authErrorMessages, authSiteUrl } from "@/lib/actions/auth-errors";

const MSG = authErrorMessages;

export async function resendActivationAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: true; error?: { code: AuthErrorCode; message: string } }> {
  const raw = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const parsed = resendActivationEmailSchema.safeParse({ email: raw });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.email?.[0] ?? "Courriel invalide.";
    return { error: { code: "empty", message: msg } };
  }
  const email = parsed.data.email;

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${authSiteUrl()}/auth/callback?next=${encodeURIComponent("/activate?activated=1")}`,
    },
  });

  if (error) {
    return { error: { code: "failed", message: MSG.failed } };
  }

  return { ok: true };
}
