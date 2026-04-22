import Link from "next/link";
import { redirect } from "next/navigation";
import { MesQuestionsFiltres } from "@/components/questions/MesQuestionsFiltres";
import { MesTachesThumbnailCard } from "@/components/questions/MesTachesThumbnailCard";
import { createClient } from "@/lib/supabase/server";
import { getMyTacheThumbnailList } from "@/lib/queries/my-tache-thumbnails";
import { parseMyTacheListFiltre } from "@/lib/queries/user-content";
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
  const filtre = parseMyTacheListFiltre(sp.filtre);
  const rows = await getMyTacheThumbnailList(filtre);

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <MesTachesThumbnailCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
