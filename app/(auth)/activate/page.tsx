import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { ActivateResendForm } from "@/components/auth/ActivateResendForm";

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ activated?: string }>;
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
  }

  const justActivated = sp.activated === "1";

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-deep">Activation du compte</h2>
      {justActivated ? (
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
