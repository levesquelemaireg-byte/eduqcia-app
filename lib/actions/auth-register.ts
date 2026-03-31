"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { loadCssEcoles, validateCssAndSchool } from "@/lib/data/load-css-ecoles";
import { isInstitutionalEmail } from "@/lib/utils/emailValidation";
import type { UserRole } from "@/lib/types";
import { RegisterSchema } from "@/lib/schemas/auth";
import type { AuthErrorCode } from "@/lib/actions/auth-errors";
import { authErrorMessages, authSiteUrl } from "@/lib/actions/auth-errors";

const MSG = authErrorMessages;

export async function registerAction(
  data: unknown,
): Promise<{ ok?: true; error?: { code: AuthErrorCode; message: string } }> {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { error: { code: "validation", message: MSG.validation } };
  }

  const input = parsed.data;

  try {
    const firstName = input.first_name.trim();
    const lastName = input.last_name.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const passwordConfirm = input.password_confirm;
    const profileType = input.profile_type;
    const css = input.css.trim();
    const school = input.school.trim();
    const niveau = input.niveau.trim();

    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      return { error: { code: "empty_fields", message: MSG.empty_fields } };
    }

    if (!isInstitutionalEmail(email)) {
      return { error: { code: "email_not_allowed", message: MSG.email_not_allowed } };
    }

    if (password.length < 8) {
      return { error: { code: "password_too_short", message: MSG.password_too_short } };
    }

    if (password !== passwordConfirm) {
      return { error: { code: "password_mismatch", message: MSG.password_mismatch } };
    }

    const isEnseignant = profileType === "enseignant";
    const role: UserRole = isEnseignant ? "enseignant" : "conseiller_pedagogique";

    let schoolJson: string | null = null;

    if (isEnseignant) {
      if (!css || !school || !niveau) {
        return { error: { code: "empty_fields", message: MSG.empty_fields } };
      }
      const map = await loadCssEcoles();
      if (!validateCssAndSchool(map, css, school)) {
        return { error: { code: "failed", message: "Centre de services ou école invalide." } };
      }
      schoolJson = JSON.stringify({ css, ecole: school, niveau });
    } else {
      if (css) {
        const map = await loadCssEcoles();
        if (!(css in map)) {
          return { error: { code: "failed", message: "Centre de services invalide." } };
        }
      }
      schoolJson = JSON.stringify({
        css: css || null,
        ecole: null,
        niveau: null,
      });
    }

    const supabase = await createClient();
    const fullName = `${firstName} ${lastName}`;
    const redirectNext = encodeURIComponent("/activate?activated=1");

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${authSiteUrl()}/auth/callback?next=${redirectNext}`,
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (signUpError) {
      console.error("registerAction signUp failed:", signUpError.message ?? "unknown");
      const m = signUpError.message.toLowerCase();
      if (
        m.includes("already registered") ||
        m.includes("user already") ||
        m.includes("already been registered")
      ) {
        return { error: { code: "email_exists", message: MSG.email_exists } };
      }
      return { error: { code: "failed", message: MSG.failed } };
    }

    if (!authData.user) {
      return { error: { code: "failed", message: MSG.failed } };
    }

    const admin = createServiceClient();
    const hasSession = Boolean(authData.session);
    const now = new Date().toISOString();

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        status: hasSession ? "active" : "pending",
        school: schoolJson,
        activated_at: hasSession ? now : null,
        activation_token: null,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("registerAction profile upsert failed:", profileError.message ?? "unknown");
      return { error: { code: "failed", message: MSG.failed } };
    }

    return { ok: true };
  } catch (error) {
    console.error("registerAction error:", error instanceof Error ? error.message : "unknown");
    return { error: { code: "failed", message: "Erreur lors de l'inscription." } };
  }
}
