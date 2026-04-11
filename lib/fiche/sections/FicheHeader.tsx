"use client";

import type { HeaderData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { IconBadge } from "@/lib/fiche/primitives/IconBadge";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET } from "@/lib/ui/fiche-layout";
import { cn } from "@/lib/utils/cn";

type Props = { data: HeaderData; mode: FicheMode };

/**
 * En-tête fiche — icône OI grand format + pastilles métadonnées.
 * Grille 96px + contenu (sommaire/lecture). Compact en thumbnail.
 */
export function FicheHeader({ data, mode }: Props) {
  const showOiPill = Boolean(data.oi?.titre?.trim());
  const showComportementPill = Boolean(data.comportement?.id?.trim());
  const showAspectsPill = data.aspectsSociete.length > 0;
  const hasAnyPill =
    showOiPill ||
    showComportementPill ||
    showAspectsPill ||
    Boolean(data.niveau) ||
    Boolean(data.discipline);

  if (mode === "thumbnail") {
    return (
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {data.oi ? <IconBadge glyph={data.oi.icone} mode={mode} /> : null}
        {hasAnyPill ? (
          <ChipBar className="gap-1.5">
            {showOiPill ? <MetaChip icon="psychology" label={data.oi!.titre} mode={mode} /> : null}
            {data.niveau ? <MetaChip icon="school" label={data.niveau} mode={mode} /> : null}
          </ChipBar>
        ) : null}
      </div>
    );
  }

  return (
    <header className="relative grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-stretch">
      <div className="relative flex items-center justify-center px-1 py-0">
        {data.oi ? (
          <IconBadge glyph={data.oi.icone} mode={mode} />
        ) : (
          <div
            className="h-14 w-14 shrink-0 rounded-full border-2 border-dashed border-border animate-pulse"
            aria-hidden="true"
          />
        )}
        <span
          className={cn("absolute right-0 w-px bg-border", FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET)}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 px-4 py-[1.35rem] pr-5 sm:px-5">
        {hasAnyPill ? (
          <ChipBar>
            {showOiPill ? <MetaChip icon="psychology" label={data.oi!.titre} mode={mode} /> : null}
            {data.niveau ? <MetaChip icon="school" label={data.niveau} mode={mode} /> : null}
            {data.discipline ? (
              <MetaChip icon="menu_book" label={data.discipline} mode={mode} />
            ) : null}
            {showAspectsPill ? (
              <MetaChip icon="deployed_code" label={data.aspectsSociete.join(" · ")} mode={mode} />
            ) : null}
          </ChipBar>
        ) : null}
      </div>
    </header>
  );
}
