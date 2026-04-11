"use client";

import type { DocFooterData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";

type Props = { data: DocFooterData; mode: FicheMode };

/** Pied de fiche document — auteur, date, usages, statut publication. */
export function DocFicheFooter({ data, mode: _mode }: Props) {
  return (
    <footer className="border-t border-border text-xs text-muted">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              person
            </span>
            {data.authorName || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              calendar_today
            </span>
            {data.created || "—"}
          </span>
          {data.usageCaption ? (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                link
              </span>
              {data.usageCaption}
            </span>
          ) : null}
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
