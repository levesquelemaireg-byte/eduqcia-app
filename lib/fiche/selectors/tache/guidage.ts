/**
 * Selector du guidage pour la vue détaillée tâche.
 * Retourne le HTML sanitisé ou null si vide.
 */

import { sanitize } from "@/lib/fiche/helpers";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import type { TaeFicheData } from "@/lib/types/fiche";

export type GuidageData = {
  /** HTML sanitisé */
  html: string;
};

export function selectGuidage(state: TaeFicheData): GuidageData | null {
  if (!hasFicheContent(state.guidage)) return null;
  return { html: sanitize(state.guidage) };
}
