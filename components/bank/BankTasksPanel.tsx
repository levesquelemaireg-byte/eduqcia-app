import Link from "next/link";
import { BankThumbnailCard } from "@/components/bank/BankThumbnailCard";
import { BankTaskFilters } from "@/components/bank/BankTaskFilters";
import { getBankTacheFilterRefs } from "@/lib/queries/bank-filter-ref-data";
import {
  BANK_PAGE_SIZE,
  getBankPublishedTachePage,
  serializeBankTacheQueryForHref,
  type BankTacheQuery,
} from "@/lib/queries/bank-tasks";
import { createClient } from "@/lib/supabase/server";
import { BANK_TASK_LOAD_MORE, PAGE_BANK_EMPTY } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  query: BankTacheQuery;
};

export async function BankTasksPanel({ query }: Props) {
  const supabase = await createClient();
  const [refs, pageResult] = await Promise.all([
    getBankTacheFilterRefs(supabase, query.filters.oiId ?? null),
    getBankPublishedTachePage(supabase, query),
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <BankThumbnailCard key={row.id} row={row} />
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center">
              <Link
                href={serializeBankTacheQueryForHref(query, { page: query.page + 1 })}
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
