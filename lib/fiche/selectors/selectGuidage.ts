import { ready, skeleton, hidden, sanitize } from "@/lib/fiche/helpers";
import type { SectionState, GuidageData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import { selectNRContent } from "@/lib/fiche/selectors/selectNRContent";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";

/**
 * Guidage complémentaire — HTML sanitisé.
 * Hidden si aucune OI sélectionnée. Skeleton si pas de contenu.
 */
export function selectGuidage(state: TaeFormState, _refs: SelectorRefs): SectionState<GuidageData> {
  if (!state.bloc2.oiId) return hidden();

  const nrContent = selectNRContent(state);
  const rawHtml = nrContent?.guidage ?? state.bloc3.guidage;

  if (!rawHtml || !hasFicheContent(rawHtml)) return skeleton();

  return ready({ html: sanitize(rawHtml) });
}
