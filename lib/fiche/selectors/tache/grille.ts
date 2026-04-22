/**
 * Selector de la grille d'évaluation pour la vue détaillée tâche.
 * Retourne l'identifiant de l'outil d'évaluation ou null si absent.
 */

import type { TacheFicheData } from "@/lib/types/fiche";

export type GrilleData = {
  /** Id de l'outil d'évaluation (clé dans grilles-evaluation.json) */
  outilEvaluationId: string;
};

export function selectGrille(state: TacheFicheData): GrilleData | null {
  if (!state.outilEvaluation) return null;
  return { outilEvaluationId: state.outilEvaluation };
}
