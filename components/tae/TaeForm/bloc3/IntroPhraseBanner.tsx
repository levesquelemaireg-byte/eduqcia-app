"use client";

import { buildIntroPhrase } from "@/lib/tae/consigne-helpers";

export function IntroPhraseBanner({ nbDocuments }: { nbDocuments: number | null }) {
  if (nbDocuments == null || nbDocuments <= 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
      <span
        className="material-symbols-outlined mt-0.5 shrink-0 text-[1em] text-accent"
        aria-hidden="true"
      >
        info
      </span>
      <div>
        <p className="text-steel">
          La phrase d&apos;introduction a été générée selon le comportement attendu sélectionné à
          l&apos;étape précédente.
        </p>
        <p className="mt-2 font-medium italic text-accent">{buildIntroPhrase(nbDocuments)}</p>
      </div>
    </div>
  );
}
