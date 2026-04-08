import { TaeForm } from "@/components/tae/TaeForm";
import { getWizardDraftForUser } from "@/lib/queries/tae-draft";
import { createClient } from "@/lib/supabase/server";
import { CTA_CREER_UNE_TACHE, PAGE_CREER_UNE_TACHE_SUBTITLE } from "@/lib/ui/ui-copy";
import { redirect } from "next/navigation";

export default async function NewQuestionPage() {
  const draftLoad = await getWizardDraftForUser();
  const savedServerDraft = draftLoad.status === "ok" ? draftLoad.state : null;
  const serverDraftObsolete = draftLoad.status === "obsolete";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let authorFullName = "—";
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = profile?.full_name?.trim();
  if (name) authorFullName = name;

  const wizardPreviewMeta = {
    authorFullName,
    draftStartedAtIso: new Date().toISOString(),
  };

  return (
    <TaeForm
      savedServerDraft={savedServerDraft}
      serverDraftObsolete={serverDraftObsolete}
      wizardPreviewMeta={wizardPreviewMeta}
      currentUserId={user.id}
    >
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
          {CTA_CREER_UNE_TACHE}
        </h1>
        <p className="mt-2 max-w-none text-sm text-muted md:text-base">
          {PAGE_CREER_UNE_TACHE_SUBTITLE}
        </p>
      </header>
    </TaeForm>
  );
}
