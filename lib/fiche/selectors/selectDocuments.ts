import { ready } from "@/lib/fiche/helpers";
import type { SectionState, DocumentsData, SelectorRefs } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";
import type { DocumentFiche } from "@/lib/types/fiche";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { getSlotData, slotLetter, type DocumentSlotData } from "@/lib/tae/document-helpers";

/** Convertit un slot du wizard en DocumentFiche pour affichage. */
function documentSlotToFiche(slotId: DocumentSlotId, slot: DocumentSlotData): DocumentFiche {
  const legendTrim = slot.image_legende.trim();
  const hasLegend = legendTrim.length > 0;
  const pos = slot.image_legende_position;
  return {
    letter: slotLetter(slotId),
    titre: slot.titre,
    contenu: slot.contenu,
    source_citation: slot.source_citation,
    type: slot.type,
    image_url: slot.imageUrl,
    imagePixelWidth: slot.imagePixelWidth,
    imagePixelHeight: slot.imagePixelHeight,
    printImpressionScale: 1,
    imageLegende: hasLegend ? legendTrim : null,
    imageLegendePosition: hasLegend && pos ? pos : null,
  };
}

/**
 * Documents historiques — toujours `ready` (le composant affiche des placeholders vides).
 */
export function selectDocuments(
  state: TaeFormState,
  _refs: SelectorRefs,
): SectionState<DocumentsData> {
  const documents: DocumentFiche[] = state.bloc2.documentSlots.map(({ slotId }) =>
    documentSlotToFiche(slotId, getSlotData(state.bloc4.documents, slotId)),
  );

  return ready({ documents });
}
