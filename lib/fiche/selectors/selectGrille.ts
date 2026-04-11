import { ready, hidden } from "@/lib/fiche/helpers";
import type { SectionState, GrilleData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";

/**
 * Grille d'évaluation — visible seulement si un outil d'évaluation est sélectionné.
 * `visibleIn: ['sommaire', 'lecture']` dans la config.
 */
export function selectGrille(state: TaeFormState, _refs: SelectorRefs): SectionState<GrilleData> {
  const outil = state.bloc2.outilEvaluation;
  if (!outil) return hidden();

  return ready({ outilEvaluation: outil });
}
