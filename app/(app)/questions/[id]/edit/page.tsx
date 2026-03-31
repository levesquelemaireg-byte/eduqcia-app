import { TaeForm } from "@/components/tae/TaeForm";
import { fetchTaeFormStateForEdit } from "@/lib/queries/tae-for-edit";
import { createClient } from "@/lib/supabase/server";
import { PAGE_MODIFIER_UNE_TACHE_SUBTITLE, PAGE_MODIFIER_UNE_TACHE_TITLE } from "@/lib/ui/ui-copy";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tae, error } = await supabase
    .from("tae")
    .select("id, auteur_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !tae) notFound();
  if (tae.auteur_id !== user.id) redirect(`/questions/${id}`);

  const initialState = await fetchTaeFormStateForEdit(supabase, id, user.id);
  if (!initialState) notFound();

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
      editingTaeId={id}
      serverInitialState={initialState}
      savedServerDraft={null}
      wizardPreviewMeta={wizardPreviewMeta}
      currentUserId={user.id}
    >
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
          {PAGE_MODIFIER_UNE_TACHE_TITLE}
        </h1>
        <p className="mt-2 max-w-none text-sm text-muted md:text-base">
          {PAGE_MODIFIER_UNE_TACHE_SUBTITLE}
        </p>
      </header>
    </TaeForm>
  );
}
