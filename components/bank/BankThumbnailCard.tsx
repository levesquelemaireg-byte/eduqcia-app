"use client";

import Link from "next/link";
import { FicheThumbnail } from "@/components/tae/FicheThumbnail";
import { BankAddToEvaluationLauncher } from "@/components/bank/BankAddToEvaluationLauncher";
import { toThumbnailFicheData } from "@/lib/fiche/adapters/to-thumbnail-fiche-data";
import { canonicalOiIcone } from "@/lib/tae/oi-canonical";
import type { BankTaeRow } from "@/lib/queries/bank-tasks";
import { BANK_TASK_BY, BANK_TASK_LINK_VOIR, BANK_TASK_PUBLISHED_ON } from "@/lib/ui/ui-copy";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";

type Props = {
  row: BankTaeRow;
};

function bankRowToThumbnailInput(row: BankTaeRow) {
  const icone = canonicalOiIcone(row.oi_id);
  return {
    id: row.id,
    consigne: row.consigne ?? "",
    is_published: true,
    updated_at: row.updated_at ?? row.created_at ?? "",
    auteur_id: "",
    oi:
      row.oi_id && row.oi_titre
        ? { id: row.oi_id, titre: row.oi_titre, icone: icone ?? "cognition" }
        : null,
    niveau: row.niveau_label ?? "",
    discipline: row.discipline_label ?? "",
    nbDocuments: 0,
  };
}

/**
 * Carte vignette TAÉ pour la banque collaborative.
 * FicheThumbnail + métadonnées (auteur, date) + actions (Voir, Ajouter à épreuve).
 */
export function BankThumbnailCard({ row }: Props) {
  const tae = toThumbnailFicheData(bankRowToThumbnailInput(row));
  const dateSource = row.created_at ?? row.updated_at;
  const dateLabel = formatDateFrCaMedium(dateSource);
  const author = row.auteur_nom?.trim() || "\u2014";

  return (
    <article className="relative flex flex-col rounded-2xl border border-border bg-panel shadow-sm">
      <FicheThumbnail tae={tae} />
      {/* Métadonnées sous la vignette */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2 text-xs text-muted">
        <span>
          {BANK_TASK_PUBLISHED_ON} {dateLabel}
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>
          {BANK_TASK_BY} {author}
        </span>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
        <BankAddToEvaluationLauncher taeId={row.id} />
        <Link
          href={`/questions/${row.id}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-panel px-3 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
        >
          {BANK_TASK_LINK_VOIR}
        </Link>
      </div>
    </article>
  );
}
