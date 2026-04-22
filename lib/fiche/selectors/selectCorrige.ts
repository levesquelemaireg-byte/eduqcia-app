import { ready, skeleton, sanitize } from "@/lib/fiche/helpers";
import type { SectionState, CorrigeData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { selectNRContent } from "@/lib/fiche/selectors/selectNRContent";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";

/**
 * Corrigé de la tâche — HTML sanitisé + notes correcteur optionnelles.
 */
export function selectCorrige(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<CorrigeData> {
  const nrContent = selectNRContent(state);
  const rawHtml = nrContent?.corrige ?? state.bloc5.corrige;

  if (!rawHtml || !hasFicheContent(rawHtml)) return skeleton();

  const notesRaw = state.bloc5.notesCorrecteur?.trim();

  return ready({
    html: sanitize(rawHtml),
    notesCorrecteur: notesRaw && notesRaw.length > 0 ? notesRaw : null,
  });
}
