"use client";

import { SourceTypeRadiosWithTooltips } from "@/components/documents/SourceTypeRadiosWithTooltips";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";

type Props = {
  slot: DocumentSlotData;
  patch: (p: Partial<DocumentSlotData>) => void;
};

export function DocumentSlotSourceTypeFieldset({ slot, patch }: Props) {
  return (
    <SourceTypeRadiosWithTooltips
      value={slot.source_type}
      onChange={(v) => patch({ source_type: v })}
    />
  );
}
