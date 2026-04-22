import type { DocumentLegendPosition } from "@/lib/tache/document-helpers";

/** Quatre coins (ordre = rangée UI gauche → droite) — aligné `docs/DECISIONS.md` § Étape 4 · Légende. */
export const LEGEND_POSITION_GRID: {
  value: DocumentLegendPosition;
  glyph: string;
  mirror: boolean;
  aria: string;
  tooltipKey:
    | "position_top_left"
    | "position_top_right"
    | "position_bottom_left"
    | "position_bottom_right";
}[] = [
  {
    value: "haut_gauche",
    glyph: "position_top_right",
    mirror: true,
    aria: "Coin haut gauche",
    tooltipKey: "position_top_left",
  },
  {
    value: "haut_droite",
    glyph: "position_top_right",
    mirror: false,
    aria: "Coin haut droit",
    tooltipKey: "position_top_right",
  },
  {
    value: "bas_gauche",
    glyph: "position_bottom_left",
    mirror: false,
    aria: "Coin bas gauche",
    tooltipKey: "position_bottom_left",
  },
  {
    value: "bas_droite",
    glyph: "position_bottom_right",
    mirror: false,
    aria: "Coin bas droit",
    tooltipKey: "position_bottom_right",
  },
];
