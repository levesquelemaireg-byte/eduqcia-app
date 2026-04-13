"use client";

import { stripHtmlToPlainText } from "@/lib/documents/strip-html";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";

type Props = {
  slot: DocumentSlotData;
  onRequestChangeMode: () => void;
};

export function DocumentSlotReuseBlock({ slot, onRequestChangeMode }: Props) {
  return (
    <div className="space-y-4 px-4 pb-5 pt-2 sm:px-5">
      <div className="rounded-xl bg-accent/6 p-4 ring-1 ring-inset ring-accent/20">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-accent">
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            link
          </span>
          Réutilisé depuis la banque collaborative
        </div>
        <p className="text-sm font-semibold text-deep">{slot.titre}</p>
        <p className="mt-0.5 text-xs text-muted">
          {slot.reuse_author} · {stripHtmlToPlainText(slot.reuse_source_citation)}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-accent">
          <button type="button" className="hover:underline" disabled>
            Voir l&apos;original
          </button>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className="text-error hover:underline"
            onClick={onRequestChangeMode}
          >
            Changer de mode
          </button>
        </div>
      </div>
    </div>
  );
}
