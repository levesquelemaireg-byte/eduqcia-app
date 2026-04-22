import { ready, skeleton } from "@/lib/fiche/helpers";
import type { SectionState, ConnaissancesData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { connaissancesToFicheSlice } from "@/lib/tache/connaissances-helpers";

/**
 * Connaissances relatives — arbre hiérarchique groupé.
 * Skeleton si aucune connaissance sélectionnée.
 */
export function selectConnaissances(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<ConnaissancesData> {
  const connaissances = connaissancesToFicheSlice(state.bloc7.connaissances);
  if (connaissances.length === 0) return skeleton();

  return ready({ connaissances });
}
