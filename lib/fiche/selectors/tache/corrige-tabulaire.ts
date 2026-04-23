import { hidden, ready, skeleton } from "@/lib/fiche/helpers";
import type { SectionState, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import {
  construireCorrigeTabulaire,
  type CorrigeTabulaire,
} from "@/lib/tache/schema-cd1/corrige-tabulaire";

export type CorrigeTabulaireData = {
  corrige: CorrigeTabulaire;
  notesCorrecteurHtml: string | null;
};

export function selectCorrigeTabulaire(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<CorrigeTabulaireData> {
  const schema = state.bloc3.schemaCd1;
  if (!schema) return hidden();

  const corrige = construireCorrigeTabulaire({
    schema,
    aspectA: state.bloc2.aspectA,
    aspectB: state.bloc2.aspectB,
    documentSlots: state.bloc2.documentSlots,
    documents: state.bloc4.documents,
  });

  const auMoinsUneCase = corrige.lignes.some(
    (l) => l.guidageHtml.trim().length > 0 || l.reponse.trim().length > 0,
  );
  if (!auMoinsUneCase) return skeleton();

  return ready({
    corrige,
    notesCorrecteurHtml: hasFicheContent(state.bloc5.notesCorrecteur)
      ? state.bloc5.notesCorrecteur
      : null,
  });
}
