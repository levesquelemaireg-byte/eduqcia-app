/**
 * Selector du hero de la vue détaillée tâche.
 * Fusionne amorce+consigne (déjà dans le champ consigne TipTap),
 * résout les placeholders doc, sanitise le HTML.
 */

import { sanitize, resolveDocPlaceholders } from "@/lib/fiche/helpers";
import type { TacheFicheData } from "@/lib/types/fiche";

export type HeroData = {
  /** Clé pour MaterialSymbolOiGlyph */
  oiGlyph: string;
  /** Libellé de l'opération intellectuelle */
  oiLabel: string;
  /** HTML sanitisé — amorce + consigne fusionnées avec placeholders résolus */
  enonce: string;
  /** Énoncé du comportement attendu */
  comportementAttendu: string;
};

export function selectHero(state: TacheFicheData): HeroData {
  const nbDocs = state.documents.length;
  const enonce = sanitize(resolveDocPlaceholders(state.consigne, nbDocs));

  return {
    oiGlyph: state.oi?.icone ?? "",
    oiLabel: state.oi?.titre ?? "",
    enonce,
    comportementAttendu: state.comportement?.enonce ?? "",
  };
}
