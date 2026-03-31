import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEvaluationsList } from "@/lib/queries/user-content";
import { EVAL_LIST_LINK_EDIT } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";

export default async function EvaluationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await getMyEvaluationsList();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">Mes épreuves</h1>
        </div>
        <Link
          href="/evaluations/new"
          className="icon-text inline-flex min-h-11 shrink-0 items-center justify-center gap-[0.35em] rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
        >
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            note_add
          </span>
          Créer une épreuve
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-panel-alt/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-deep">Aucune épreuve.</p>
          <Link
            href="/evaluations/new"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:opacity-95"
          >
            Créer une épreuve
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
          {rows.map((row) => {
            const dateLabel = formatDateFrCaMedium(row.updated_at);
            return (
              <li
                key={row.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-deep">{row.titre}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                        row.is_published
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning",
                      )}
                    >
                      {row.is_published ? "Publié" : "Brouillon"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Modifiée le {dateLabel}</span>
                  </div>
                </div>
                <Link
                  href={`/evaluations/${row.id}/edit`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border bg-panel px-3 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
                >
                  {EVAL_LIST_LINK_EDIT}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
