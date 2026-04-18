import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

/** Vérifie que la cible de redirection est un chemin interne relatif. */
function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Doit commencer par / et ne pas commencer par // (protocol-relative)
  if (!/^\/[a-zA-Z0-9\-_./]*$/.test(raw)) return "/dashboard";
  return raw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = createServiceClient();
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        status: "active",
        activated_at: new Date().toISOString(),
        activation_token: null,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[auth/callback] profile activation failed:", profileError.message);
      // Ne pas rediriger avec ?activated=1 si l'activation a échoué
      return NextResponse.redirect(new URL("/activate?error=activation", request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
