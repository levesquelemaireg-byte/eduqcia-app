import { TaeForm } from "@/components/tae/TaeForm";
import type { PendingInjection } from "@/components/tae/TaeForm/InjectDocumentController";
import { getWizardDraftForUser } from "@/lib/queries/tae-draft";
import { documentsRepository } from "@/lib/repositories/documents-repository";
import { createClient } from "@/lib/supabase/server";
import { injectDocumentIntoSlot } from "@/lib/tae/inject-document-into-slot";
import { CTA_CREER_UNE_TACHE, PAGE_CREER_UNE_TACHE_SUBTITLE } from "@/lib/ui/ui-copy";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function NewQuestionPage({ searchParams }: PageProps) {
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
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile) {
    const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
    if (name) authorFullName = name;
  }

  const wizardPreviewMeta = {
    authorFullName,
    draftStartedAtIso: new Date().toISOString(),
  };

  const params = await searchParams;
  const docId = firstParam(params.doc);

  let pendingInjection: PendingInjection | null = null;
  let injectionError: "not_found" | null = null;

  if (docId) {
    const doc = await documentsRepository.getById(docId);
    if (doc) {
      pendingInjection = { data: injectDocumentIntoSlot(doc) };
    } else {
      injectionError = "not_found";
    }
  }

  return (
    <TaeForm
      savedServerDraft={savedServerDraft}
      serverDraftObsolete={serverDraftObsolete}
      wizardPreviewMeta={wizardPreviewMeta}
      currentUserId={user.id}
      pendingInjection={pendingInjection}
      injectionError={injectionError}
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
