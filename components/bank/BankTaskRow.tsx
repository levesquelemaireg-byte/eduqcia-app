import Link from "next/link";
import type { ReactNode } from "react";
import { plainConsigneForMiniature } from "@/lib/tache/consigne-helpers";
import type { BankTacheRow } from "@/lib/queries/bank-tasks";
import {
  BANK_TASK_BY,
  BANK_TASK_LINK_VOIR,
  BANK_TASK_LIST_BADGE_PUBLISHED,
  BANK_TASK_PUBLISHED_ON,
} from "@/lib/ui/ui-copy";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import { truncateText } from "@/lib/utils/stripHtml";

type Props = {
  row: BankTacheRow;
  /** CTA additionnel (ex. ajout à une épreuve brouillon). */
  trailingSlot?: ReactNode;
};

function metaParts(row: BankTacheRow): string[] {
  return [row.oi_titre, row.niveau_label, row.discipline_label].filter((x): x is string =>
    Boolean(x && x.trim()),
  );
}

export function BankTaskRow({ row, trailingSlot }: Props) {
  const preview = truncateText(plainConsigneForMiniature(row.consigne), 200);
  const publishedSource = row.created_at ?? row.updated_at;
  const dateLabel = formatDateFrCaMedium(publishedSource);
  const meta = metaParts(row);
  const author = row.auteur_nom?.trim() || "—";

  return (
    <li className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm leading-relaxed text-deep">{preview || "—"}</p>
          {meta.length > 0 ? <p className="mt-2 text-xs text-muted">{meta.join(" · ")}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 font-medium text-success">
              {BANK_TASK_LIST_BADGE_PUBLISHED}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {BANK_TASK_PUBLISHED_ON} {dateLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {BANK_TASK_BY} {author}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {trailingSlot}
          <Link
            href={`/questions/${row.id}`}
            className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-lg border border-border bg-panel px-3 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
          >
            {BANK_TASK_LINK_VOIR}
          </Link>
        </div>
      </div>
    </li>
  );
}
