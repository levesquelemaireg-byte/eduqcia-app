"use client";

import { cn } from "@/lib/utils/cn";
import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import type { FicheMode } from "@/lib/fiche/types";

type Props = {
  glyph: string;
  mode: FicheMode;
  /** Mode boxed : boîte carrée bg-panel-alt avec radius 12px. Utilisé dans le hero de la vue détaillée. */
  boxed?: boolean;
  /** Taille de la boîte en px (défaut 52). Appliqué uniquement en mode boxed. */
  size?: number;
};

/**
 * Icône OI ou catégorie document dans zone dédiée.
 * Taille adaptée au mode (plus petite en thumbnail).
 * En mode `boxed`, rend une boîte carrée avec fond panel-alt et radius 12px.
 */
export function IconBadge({ glyph, mode, boxed, size = 52 }: Props) {
  if (boxed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-panel-alt"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <MaterialSymbolOiGlyph
          glyph={glyph}
          className="leading-none text-accent"
          style={{
            fontSize: `${Math.round(size / 2)}px`,
            fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 200, "opsz" 48',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

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
