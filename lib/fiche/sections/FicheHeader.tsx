"use client";

import type { HeaderData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { IconBadge } from "@/lib/fiche/primitives/IconBadge";
import { MetaChip, chipPropsForFicheMode } from "@/lib/fiche/primitives/MetaChip";
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
  const showParcoursPill = Boolean(data.parcours?.label?.trim());
  const showComportementPill = Boolean(data.comportement?.id?.trim());
  const showAspectsPill = data.aspectsSociete.length > 0;
  const hasAnyPill =
    showOiPill ||
    showParcoursPill ||
    showComportementPill ||
    showAspectsPill ||
    Boolean(data.niveau) ||
    Boolean(data.discipline);
  const chipProps = chipPropsForFicheMode(mode);

  const badgeGlyph = data.oi?.icone ?? data.parcours?.icone ?? null;
  const badgeMirror = data.oi ? false : Boolean(data.parcours?.iconMirror);
  const parcoursChipIconClass = data.parcours?.iconMirror ? "-scale-x-100" : undefined;

  if (mode === "thumbnail") {
    return (
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {badgeGlyph ? <IconBadge glyph={badgeGlyph} mode={mode} mirror={badgeMirror} /> : null}
        {hasAnyPill ? (
          <ChipBar className="gap-1.5">
            {showOiPill ? (
              <MetaChip icon="psychology" label={data.oi!.titre} {...chipProps} />
            ) : showParcoursPill ? (
              <MetaChip
                icon={data.parcours!.icone}
                label={data.parcours!.label}
                iconClassName={parcoursChipIconClass}
                {...chipProps}
              />
            ) : null}
            {data.niveau ? <MetaChip icon="school" label={data.niveau} {...chipProps} /> : null}
          </ChipBar>
        ) : null}
      </div>
    );
  }

  return (
    <header className="relative grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-stretch">
      <div className="relative flex items-center justify-center px-1 py-0">
        {badgeGlyph ? (
          <IconBadge glyph={badgeGlyph} mode={mode} mirror={badgeMirror} />
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
            {showOiPill ? (
              <MetaChip icon="psychology" label={data.oi!.titre} {...chipProps} />
            ) : showParcoursPill ? (
              <MetaChip
                icon={data.parcours!.icone}
                label={data.parcours!.label}
                iconClassName={parcoursChipIconClass}
                {...chipProps}
              />
            ) : null}
            {data.niveau ? <MetaChip icon="school" label={data.niveau} {...chipProps} /> : null}
            {data.discipline ? (
              <MetaChip icon="menu_book" label={data.discipline} {...chipProps} />
            ) : null}
            {showAspectsPill ? (
              <MetaChip
                icon="deployed_code"
                label={data.aspectsSociete.join(" · ")}
                {...chipProps}
              />
            ) : null}
          </ChipBar>
        ) : null}
      </div>
    </header>
  );
}
