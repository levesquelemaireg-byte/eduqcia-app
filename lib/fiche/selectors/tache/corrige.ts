/**
 * Selector du corrigé (production attendue) pour la vue détaillée tâche.
 * Retourne le HTML sanitisé ou null si vide.
 * Notes au correcteur : hors scope v1 (champ absent en BDD).
 */

import { sanitize } from "@/lib/fiche/helpers";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import type { TacheFicheData } from "@/lib/types/fiche";

export type CorrigeData = {
  /** HTML sanitisé */
  html: string;
};

export function selectCorrige(state: TacheFicheData): CorrigeData | null {
  if (!hasFicheContent(state.corrige)) return null;
  return { html: sanitize(state.corrige) };
}
