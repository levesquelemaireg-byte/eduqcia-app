"use client";

import type { FooterData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { formatFicheDate } from "@/lib/tae/fiche-helpers";
import { SkeletonFooterNbLignes } from "@/components/tae/fiche/FicheSkeletons";

type Props = { data: FooterData; mode: FicheMode };

/** Pied de fiche — auteurs, date, nb lignes, statut publication, version. */
export function FicheFooter({ data, mode: _mode }: Props) {
  const auteurs = data.auteurs.map((a) => a.full_name).join(" · ");

  return (
    <footer className="border-t border-border text-xs text-muted">
      {data.version > 1 && data.versionUpdatedAt ? (
        <p className="px-5 pb-2 pt-3">
          Version {data.version} — mise à jour majeure le {formatFicheDate(data.versionUpdatedAt)}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              person
            </span>
            {auteurs || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              calendar_today
            </span>
            {formatFicheDate(data.createdAt)}
          </span>
          {!data.showStudentAnswerLines ? null : data.hideNbLignesSkeleton ? (
            <SkeletonFooterNbLignes />
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                format_line_spacing
              </span>
              {data.nbLignes} lignes
            </span>
          )}
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            data.isPublished ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${data.isPublished ? "bg-success" : "bg-warning"}`}
          />
          {data.isPublished ? "Publiée" : "Brouillon"}
        </span>
      </div>
    </footer>
  );
}
