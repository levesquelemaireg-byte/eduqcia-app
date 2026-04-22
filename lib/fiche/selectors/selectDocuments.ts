import { ready } from "@/lib/fiche/helpers";
import type { SectionState, DocumentsData, SelectorRefs } from "@/lib/fiche/types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import type { DocumentFiche } from "@/lib/types/fiche";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { getSlotData, slotLetter, type DocumentSlotData } from "@/lib/tache/document-helpers";
import {
  getDocumentCategorieTextuelle,
  documentCategorieIconographiqueLabel,
} from "@/lib/tache/document-categories-helpers";

/** Convertit un slot du wizard en DocumentFiche pour affichage. */
function documentSlotToFiche(slotId: DocumentSlotId, slot: DocumentSlotData): DocumentFiche {
  const legendTrim = slot.image_legende.trim();
  const hasLegend = legendTrim.length > 0;
  const pos = slot.image_legende_position;
  const categorieLabel =
    slot.type === "textuel" && slot.categorie_textuelle
      ? (getDocumentCategorieTextuelle(slot.categorie_textuelle)?.label ?? null)
      : slot.type === "iconographique" && slot.type_iconographique
        ? (documentCategorieIconographiqueLabel(slot.type_iconographique) ?? null)
        : null;
  return {
    letter: slotLetter(slotId),
    titre: slot.titre,
    contenu: slot.contenu,
    source_citation: slot.source_citation,
    type: slot.type,
    image_url: slot.imageUrl,
    imagePixelWidth: slot.imagePixelWidth,
    imagePixelHeight: slot.imagePixelHeight,
    imageLegende: hasLegend ? legendTrim : null,
    imageLegendePosition: hasLegend && pos ? pos : null,
    sourceType:
      slot.source_type !== "primaire" && slot.source_type !== "secondaire"
        ? undefined
        : slot.source_type,
    repereTemporel: slot.repere_temporel?.trim() || null,
    categorieLabel,
  };
}

/**
 * Documents historiques — toujours `ready` (le composant affiche des placeholders vides).
 */
export function selectDocuments(
  state: TacheFormState,
  _refs: SelectorRefs,
): SectionState<DocumentsData> {
  const documents: DocumentFiche[] = state.bloc2.documentSlots.map(({ slotId }) =>
    documentSlotToFiche(slotId, getSlotData(state.bloc4.documents, slotId)),
  );

  return ready({ documents });
}
