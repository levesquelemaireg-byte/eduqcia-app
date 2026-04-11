"use client";

import Link from "next/link";
import { plainConsigneForMiniature } from "@/lib/tae/consigne-helpers";
import type { TaeFicheData } from "@/lib/types/fiche";
import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import { MetaPill } from "@/components/tae/fiche/MetaPill";
import { FicheFooter } from "@/components/tae/fiche/FicheFooter";
import { TaeCardMenu } from "@/components/tae/fiche/TaeCardMenu";
import { FicheThumbnail } from "@/components/tae/FicheThumbnail";
import { PlaygroundFragmentWrapper } from "@/components/playground/PlaygroundFragmentWrapper";
import type { PlaygroundViewMode } from "@/lib/fragment-playground/types";

type Props = {
  tae: TaeFicheData;
  viewMode: PlaygroundViewMode;
  isolatedFragmentId: string;
};

/**
 * Thumbnail : `TaeCard` prod en vue complète, ou sous-blocs avec mêmes briques que `TaeCard.tsx` (fichier prod inchangé).
 */
export function PlaygroundTaeCardRenderer({ tae, viewMode, isolatedFragmentId }: Props) {
  if (viewMode === "full") {
    return (
      <PlaygroundFragmentWrapper name="TaeCard">
        <FicheThumbnail tae={tae} />
      </PlaygroundFragmentWrapper>
    );
  }

  const isAuteur = false;
  const previewSnippet = plainConsigneForMiniature(tae.consigne, tae.documents.length);

  if (isolatedFragmentId === "TaeCardCorps") {
    return (
      <article
        className="relative rounded-2xl border border-border bg-panel p-5 shadow-sm"
        data-fiche-menu-shell
      >
        <PlaygroundFragmentWrapper name="TaeCardCorps">
          <div className="absolute right-4 top-4">
            <TaeCardMenu taeId={tae.id} isAuteur={isAuteur} />
          </div>
          <Link href={`/questions/${tae.id}`} className="block pr-8">
            <div className="flex gap-4">
              <div className="shrink-0">
                <MaterialSymbolOiGlyph
                  glyph={tae.oi.icone}
                  className="text-accent"
                  style={{ fontSize: "1.5rem" }}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
                  Consigne
                </p>
                <p className="line-clamp-2 text-sm font-medium leading-relaxed text-deep">
                  {previewSnippet}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <MetaPill icon="psychology" label={tae.oi.titre} />
                  {tae.aspects_societe.length > 0 ? (
                    <MetaPill icon="deployed_code" label={tae.aspects_societe.join(" · ")} />
                  ) : null}
                  <MetaPill icon="school" label={tae.niveau.label} />
                  <MetaPill icon="menu_book" label={tae.discipline.label} />
                </div>
              </div>
            </div>
          </Link>
        </PlaygroundFragmentWrapper>
      </article>
    );
  }

  if (isolatedFragmentId === "TaeCardPied") {
    return (
      <div className="rounded-2xl border border-border bg-panel p-5 shadow-sm">
        <PlaygroundFragmentWrapper name="TaeCardPied">
          <FicheFooter tae={tae} compact />
        </PlaygroundFragmentWrapper>
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">
      Fragment inconnu : {isolatedFragmentId}
    </p>
  );
}
