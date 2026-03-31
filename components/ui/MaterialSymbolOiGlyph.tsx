import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

type Props = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  /** Nom du glyphe Material (ex. `oi.json` → `icone`, `tae.oi.icone`). */
  glyph: string;
};

/**
 * Glyphe d’opération intellectuelle — `material-symbols-outlined` + `data-oi-glyph`.
 * Présentation (rotation, etc.) : `app/globals.css` + token `--oi-glyph-*` — pas de `rotate-*` ad hoc par écran.
 * @see docs/DESIGN-SYSTEM.md §1.4 (Glyphes OI)
 */
export function MaterialSymbolOiGlyph({ glyph, className, ...rest }: Props) {
  return (
    <span data-oi-glyph={glyph} className={cn("material-symbols-outlined", className)} {...rest}>
      {glyph}
    </span>
  );
}
