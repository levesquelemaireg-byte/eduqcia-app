"use client";

import { useEffect } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { useDocumentSlotsAccordion } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionContext";
import { canAccessDocumentSlot, type DocumentSlotData } from "@/lib/tache/document-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";

function firstAccessibleSlotId(
  orderedIds: DocumentSlotId[],
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): DocumentSlotId | null {
  for (let i = 0; i < orderedIds.length; i++) {
    if (canAccessDocumentSlot(orderedIds, i, documents)) {
      return orderedIds[i];
    }
  }
  return null;
}

type Props = {
  orderedIds: DocumentSlotId[];
};

/** Si le panneau ouvert devient inaccessible (ex. remise à vide d’un slot amont), rouvre le premier slot accessible. */
export function DocumentSlotsAccordionSync({ orderedIds }: Props) {
  const { state } = useTacheForm();
  const { expandedSlotId, setExpandedSlotId } = useDocumentSlotsAccordion();

  useEffect(() => {
    if (orderedIds.length === 0) return;

    if (expandedSlotId === null) return;

    const idx = orderedIds.indexOf(expandedSlotId);
    if (idx === -1 || !canAccessDocumentSlot(orderedIds, idx, state.bloc4.documents)) {
      setExpandedSlotId(firstAccessibleSlotId(orderedIds, state.bloc4.documents));
    }
  }, [expandedSlotId, orderedIds, state.bloc4.documents, setExpandedSlotId]);

  return null;
}
