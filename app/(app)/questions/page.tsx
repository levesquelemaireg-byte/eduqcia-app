import Link from "next/link";
import { redirect } from "next/navigation";
import { MesQuestionsFiltres } from "@/components/questions/MesQuestionsFiltres";
import { MesQuestionsRow } from "@/components/questions/MesQuestionsRow";
import { createClient } from "@/lib/supabase/server";
import { getMyTaeList, parseMyTaeListFiltre } from "@/lib/queries/user-content";
import { plainConsigneForMiniature } from "@/lib/tae/consigne-helpers";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import { truncateText } from "@/lib/utils/stripHtml";
import {
  CTA_CREER_UNE_TACHE,
  LISTE_TACHES_VIDE_CATEGORIE,
  PAGE_LISTE_MES_TACHES_SUBTITLE,
  PAGE_LISTE_MES_TACHES_TITLE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type PageProps = {
  searchParams: Promise<{ filtre?: string }>;
};

export default async function QuestionsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const filtre = parseMyTaeListFiltre(sp.filtre);
  const rows = await getMyTaeList(filtre);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
            {PAGE_LISTE_MES_TACHES_TITLE}
          </h1>
          <p className="mt-2 text-sm text-muted md:text-base">{PAGE_LISTE_MES_TACHES_SUBTITLE}</p>
        </div>
        <Link
          href="/questions/new"
          className={cn(
            "icon-text inline-flex min-h-11 shrink-0 items-center justify-center gap-[0.35em] rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95",
          )}
        >
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            post_add
          </span>
          {CTA_CREER_UNE_TACHE}
        </Link>
      </div>

      <MesQuestionsFiltres actif={filtre} />

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-panel-alt/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-deep">{LISTE_TACHES_VIDE_CATEGORIE}</p>
          <Link
            href="/questions/new"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:opacity-95"
          >
            {CTA_CREER_UNE_TACHE}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
          {rows.map((row) => {
            const preview = truncateText(plainConsigneForMiniature(row.consigne), 160);
            const dateLabel = formatDateFrCaMedium(row.updated_at);
            return (
              <MesQuestionsRow
                key={row.id}
                id={row.id}
                preview={preview || "—"}
                isPublished={row.is_published}
                updatedAtLabel={dateLabel}
                isWizardServerDraft={Boolean(row.isWizardServerDraft)}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
