import Link from "next/link";
import {
  getBankPublishedEvaluationsPage,
  serializeBankEvaluationsQueryForHref,
} from "@/lib/queries/bank-evaluations";
import { BANK_PAGE_SIZE } from "@/lib/queries/bank-tasks";
import { createClient } from "@/lib/supabase/server";
import {
  BANK_DOCUMENT_FILTER_RESET,
  BANK_DOCUMENT_FILTER_SUBMIT,
  BANK_EVAL_NO_EDIT_OTHER,
  BANK_EVAL_SEARCH_LABEL,
  BANK_TASK_LOAD_MORE,
  copyBankEvaluationTaskCount,
  EVAL_LIST_LINK_EDIT,
  PAGE_BANK_EVALUATIONS_CTA_INTRO,
  PAGE_BANK_EVALUATIONS_CTA_LINK,
  PAGE_BANK_EVALUATIONS_EMPTY,
} from "@/lib/ui/ui-copy";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import { cn } from "@/lib/utils/cn";

type Props = {
  viewerId: string;
  q: string;
  page: number;
};

export async function BankEvaluationsPanel({ viewerId, q, page }: Props) {
  const supabase = await createClient();
  const { rows, total } = await getBankPublishedEvaluationsPage(supabase, {
    q: q || undefined,
    page,
    viewerId,
  });
  const hasMore = (page + 1) * BANK_PAGE_SIZE < total;

  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm text-muted">
        {PAGE_BANK_EVALUATIONS_CTA_INTRO}{" "}
        <Link
          href="/evaluations/new"
          className="font-medium text-accent underline-offset-2 hover:underline"
        >
          {PAGE_BANK_EVALUATIONS_CTA_LINK}
        </Link>
        .
      </p>

      <form
        method="get"
        action="/bank"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-panel p-4 shadow-sm md:flex-row md:flex-wrap md:items-end"
      >
        <input type="hidden" name="onglet" value="evaluations" />
        <input type="hidden" name="page" value="0" />
        <div className="min-w-[12rem] flex-1 space-y-1">
          <label htmlFor="bank-eval-q" className="text-xs font-semibold text-muted">
            {BANK_EVAL_SEARCH_LABEL}
          </label>
          <input
            id="bank-eval-q"
            name="q"
            type="search"
            defaultValue={q}
            autoComplete="off"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-white"
          >
            {BANK_DOCUMENT_FILTER_SUBMIT}
          </button>
          <Link
            href="/bank?onglet=evaluations"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-deep"
          >
            {BANK_DOCUMENT_FILTER_RESET}
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-panel-alt/50 px-6 py-10 text-center text-sm text-muted">
          {PAGE_BANK_EVALUATIONS_EMPTY}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
            {rows.map((row) => {
              const dateLabel = formatDateFrCaMedium(row.updated_at);
              const author = row.auteur_nom?.trim() || "—";
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-deep">{row.titre}</p>
                    <p className="mt-1 text-xs text-muted">
                      {copyBankEvaluationTaskCount(row.nb_taches)} · {dateLabel} · {author}
                    </p>
                  </div>
                  {row.canEdit ? (
                    <Link
                      href={`/evaluations/${row.id}/edit`}
                      className={cn(
                        "inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-accent",
                        "hover:bg-accent/5",
                      )}
                    >
                      {EVAL_LIST_LINK_EDIT}
                    </Link>
                  ) : (
                    <span
                      className="inline-flex min-h-11 shrink-0 items-center px-2 text-xs text-muted"
                      title={BANK_EVAL_NO_EDIT_OTHER}
                    >
                      {BANK_EVAL_NO_EDIT_OTHER}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {hasMore ? (
            <div className="flex justify-center">
              <Link
                href={serializeBankEvaluationsQueryForHref(q || undefined, page + 1)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-panel px-5 text-sm font-semibold text-deep shadow-sm",
                  "hover:bg-panel-alt",
                )}
              >
                {BANK_TASK_LOAD_MORE}
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
