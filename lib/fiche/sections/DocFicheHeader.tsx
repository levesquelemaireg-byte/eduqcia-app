"use client";

import type { DocHeaderData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { IconBadge } from "@/lib/fiche/primitives/IconBadge";
import { MetaChip, chipPropsForFicheMode } from "@/lib/fiche/primitives/MetaChip";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET } from "@/lib/ui/fiche-layout";
import { DOCUMENT_FICHE_EYEBROW } from "@/lib/ui/ui-copy";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";
import { cn } from "@/lib/utils/cn";

type Props = { data: DocHeaderData; mode: FicheMode };

/**
 * En-tête fiche document — icône « article » + eyebrow + titre + pills.
 * Layout identique au FicheHeader TAÉ (grille 96px + contenu).
 */
export function DocFicheHeader({ data, mode }: Props) {
  const chipProps = chipPropsForFicheMode(mode);

  if (mode === "thumbnail") {
    return (
      <div className="px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-3">
          <IconBadge glyph={ICONES_METIER.documents} mode={mode} />
          <p className="line-clamp-2 min-w-0 text-sm font-bold text-deep">{data.titre}</p>
        </div>
        <ChipBar className="mt-2">
          <MetaChip icon="category" label={data.typeLabel} {...chipProps} />
          <MetaChip icon={data.structureIcon} label={data.structureLabel} {...chipProps} />
          <MetaChip icon="bookmark" label={data.sourceTypeLabel} {...chipProps} />
        </ChipBar>
      </div>
    );
  }

  return (
    <header className="relative grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-stretch">
      <div className="relative flex items-center justify-center px-1 py-0">
        <IconBadge glyph={ICONES_METIER.documents} mode={mode} />
        <span
          className={cn("absolute right-0 w-px bg-border", FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET)}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 px-4 py-[1.35rem] pr-5 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-accent">
          {DOCUMENT_FICHE_EYEBROW}
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-deep sm:text-2xl">
          {data.titre}
        </h1>
        <ChipBar className="mt-3">
          <MetaChip icon="category" label={data.typeLabel} {...chipProps} />
          <MetaChip icon={data.structureIcon} label={data.structureLabel} {...chipProps} />
          <MetaChip icon="bookmark" label={data.sourceTypeLabel} {...chipProps} />
        </ChipBar>
      </div>
    </header>
  );
}
