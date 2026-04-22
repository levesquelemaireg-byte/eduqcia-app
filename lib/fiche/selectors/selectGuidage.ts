import { ready, skeleton, hidden, sanitize } from "@/lib/fiche/helpers";
import type { SectionState, GuidageData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { selectNRContent } from "@/lib/fiche/selectors/selectNRContent";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";

/**
 * Guidage complémentaire — HTML sanitisé.
 * Hidden si aucune OI sélectionnée. Skeleton si pas de contenu.
 */
export function selectGuidage(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<GuidageData> {
  if (!state.bloc2.oiId) return hidden();

  const nrContent = selectNRContent(state);
  const rawHtml = nrContent?.guidage ?? state.bloc3.guidage;

  if (!rawHtml || !hasFicheContent(rawHtml)) return skeleton();

  return ready({ html: sanitize(rawHtml) });
}
