import { ready, hidden } from "@/lib/fiche/helpers";
import type { SectionState, GrilleData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

/**
 * Grille d'évaluation — visible seulement si un outil d'évaluation est sélectionné.
 * Résout l'entrée complète depuis refs.grilles pour rendu inline.
 */
export function selectGrille(state: TacheFormState, refs: SelectorRefs): SectionState<GrilleData> {
  const outil = state.bloc2.outilEvaluation;
  if (!outil) return hidden();

  const entry = refs.grilles.find((g) => g.id === outil) ?? null;
  return ready({ entry, outilEvaluationId: outil });
}
