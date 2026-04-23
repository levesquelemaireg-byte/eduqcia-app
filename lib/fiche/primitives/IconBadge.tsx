"use client";

import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import { cn } from "@/lib/utils/cn";
import type { FicheMode } from "@/lib/fiche/types";

type Props = {
  glyph: string;
  mode: FicheMode;
  /** Mode boxed : boîte carrée avec radius 12px. */
  boxed?: boolean;
  /** Taille de la boîte en px (défaut 52). Appliqué uniquement en mode boxed. */
  size?: number;
  /** Taille du glyphe en px. Si omis, utilise size/2. Permet un glyphe plus grand que la boîte. */
  glyphSize?: number;
  /** Variante accent : fond teal, glyphe blanc. Utilisé dans le rail. */
  accent?: boolean;
  /** Animation douce d'apparition au chargement. */
  animate?: boolean;
  /** Miroir horizontal du glyphe (`scaleX(-1)`). */
  mirror?: boolean;
};

/**
 * Icône OI ou catégorie document dans zone dédiée.
 * Taille adaptée au mode (plus petite en thumbnail).
 * En mode `boxed`, rend une boîte carrée avec fond panel-alt (ou accent si `accent`) et radius 12px.
 */
export function IconBadge({
  glyph,
  mode,
  boxed,
  size = 52,
  glyphSize,
  accent,
  animate,
  mirror,
}: Props) {
  if (boxed) {
    const resolvedGlyphSize = glyphSize ?? Math.round(size / 2);
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-(--radius-lg)",
          accent ? "bg-accent" : "bg-panel-alt",
          animate && "animate-icon-badge-in",
        )}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <MaterialSymbolOiGlyph
          glyph={glyph}
          className={cn(
            "leading-none",
            accent ? "text-white" : "text-accent",
            mirror && "-scale-x-100",
          )}
          style={{
            fontSize: `${resolvedGlyphSize}px`,
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
      className={cn("leading-none text-accent opacity-[0.88]", mirror && "-scale-x-100")}
      style={{
        fontSize,
        fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 200, "opsz" 48',
      }}
      aria-hidden="true"
    />
  );
}
