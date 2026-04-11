"use client";

import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import type { FicheMode } from "@/lib/fiche/types";

type Props = {
  glyph: string;
  mode: FicheMode;
};

/**
 * Icône OI ou catégorie document dans zone dédiée.
 * Taille adaptée au mode (plus petite en thumbnail).
 */
export function IconBadge({ glyph, mode }: Props) {
  const fontSize =
    mode === "thumbnail" ? "clamp(1.5rem, 3vmin, 2rem)" : "clamp(2.5rem, 4.25vmin, 3.35rem)";

  return (
    <MaterialSymbolOiGlyph
      glyph={glyph}
      className="leading-none text-accent opacity-[0.88]"
      style={{
        fontSize,
        fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 200, "opsz" 48',
      }}
      aria-hidden="true"
    />
  );
}
