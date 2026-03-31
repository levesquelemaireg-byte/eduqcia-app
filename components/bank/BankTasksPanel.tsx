import Link from "next/link";
import { BankAddToEvaluationLauncher } from "@/components/bank/BankAddToEvaluationLauncher";
import { BankTaskFilters } from "@/components/bank/BankTaskFilters";
import { BankTaskRow } from "@/components/bank/BankTaskRow";
import { getBankTaeFilterRefs } from "@/lib/queries/bank-filter-ref-data";
import {
  BANK_PAGE_SIZE,
  getBankPublishedTaePage,
  serializeBankTaeQueryForHref,
  type BankTaeQuery,
} from "@/lib/queries/bank-tasks";
import { createClient } from "@/lib/supabase/server";
import { BANK_TASK_LOAD_MORE, PAGE_BANK_EMPTY } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  query: BankTaeQuery;
};

export async function BankTasksPanel({ query }: Props) {
  const supabase = await createClient();
  const [refs, pageResult] = await Promise.all([
    getBankTaeFilterRefs(supabase, query.filters.oiId ?? null),
    getBankPublishedTaePage(supabase, query),
  ]);
  const { rows, total } = pageResult;
  const hasMore = (query.page + 1) * BANK_PAGE_SIZE < total;

  return (
    <div className="mt-8 space-y-6">
      <BankTaskFilters refs={refs} query={query} />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-panel-alt/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-deep">{PAGE_BANK_EMPTY}</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
            {rows.map((row) => (
              <BankTaskRow
                key={row.id}
                row={row}
                trailingSlot={<BankAddToEvaluationLauncher taeId={row.id} />}
              />
            ))}
          </ul>
          {hasMore ? (
            <div className="flex justify-center">
              <Link
                href={serializeBankTaeQueryForHref(query, { page: query.page + 1 })}
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
