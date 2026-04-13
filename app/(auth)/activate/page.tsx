import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { ActivateResendForm } from "@/components/auth/ActivateResendForm";

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = createServiceClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.status === "active") {
      redirect("/dashboard");
    }

    // Rattrapage : l'utilisateur est authentifié (email confirmé par Supabase)
    // mais le profil est encore pending — activer automatiquement.
    if (profile?.status === "pending") {
      const { error: activateError } = await admin
        .from("profiles")
        .update({
          status: "active",
          activated_at: new Date().toISOString(),
          activation_token: null,
        })
        .eq("id", user.id);
      if (!activateError) {
        redirect("/dashboard");
      }
      console.error("[activate] auto-activation failed:", activateError.message);
    }
  }

  const justActivated = sp.activated === "1";

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-deep">Activation du compte</h2>
      {sp.error === "activation" ? (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-deep">
          Une erreur est survenue lors de l&apos;activation. Veuillez réessayer en vous connectant
          directement depuis la{" "}
          <Link href="/login" className="font-medium text-accent underline">
            page de connexion
          </Link>
          .
        </div>
      ) : justActivated ? (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-deep">
          Compte activé. Vous pouvez vous{" "}
          <Link href="/login" className="font-medium text-accent underline">
            connecter
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-4 text-sm text-steel">
          <p>
            Si vous venez de vous inscrire, ouvrez le courriel de confirmation et cliquez sur le
            lien pour activer votre compte.
          </p>
          <p>Une fois le lien utilisé, vous serez redirigé ici puis pourrez vous connecter.</p>
        </div>
      )}
      <div className="mt-8 border-t border-border pt-6">
        <p className="mb-2 text-sm font-medium text-deep">Renvoyer le courriel d’activation</p>
        <ActivateResendForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-accent underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}
