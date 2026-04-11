import { ready, skeleton } from "@/lib/fiche/helpers";
import type { SectionState, CompetenceData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { cdSelectionToFicheSlice } from "@/lib/tae/cd-helpers";

/**
 * Compétence disciplinaire — arbre 3 niveaux (compétence → composante → critère).
 * Skeleton tant que rien n'est sélectionné.
 */
export function selectCD(state: TaeFormState, _refs: SelectorRefs): SectionState<CompetenceData> {
  const cd = cdSelectionToFicheSlice(state.bloc6.cd.selection);
  if (!cd) return skeleton();

  return ready({ cd });
}
