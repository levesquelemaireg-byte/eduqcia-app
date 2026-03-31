"use client";

import { DocumentLegendTextField } from "@/components/documents/DocumentLegendTextField";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";
import { countWordsFr } from "@/lib/schemas/autonomous-document";

type Props = {
  slot: DocumentSlotData;
  patch: (p: Partial<DocumentSlotData>) => void;
  legendError?: "words" | "position" | null;
};

export function DocumentSlotLegendBlock({ slot, patch, legendError }: Props) {
  const legendWords = countWordsFr(slot.image_legende);

  return (
    <div className="space-y-3 border-t border-border/50 pt-4">
      <DocumentLegendTextField
        value={slot.image_legende}
        onChange={(v) => patch({ image_legende: v })}
        legendWords={legendWords}
        showWordsError={legendError === "words"}
      />
    </div>
  );
}
