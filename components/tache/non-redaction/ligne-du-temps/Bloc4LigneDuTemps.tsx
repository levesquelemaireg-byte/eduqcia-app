"use client";

import { useMemo } from "react";
import { DocumentSlotPanel } from "@/components/tache/wizard/bloc4/DocumentSlotPanel";
import { DocumentSlotsAccordionProvider } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionSync";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  isLigneDuTempsStep3Complete,
  normalizeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import { NR_LIGNE_TEMPS_BLOC4_INFO, NR_LIGNE_TEMPS_GATE_PRE_DOCS } from "@/lib/ui/ui-copy";
import { nonRedactionLignePayload } from "@/lib/tache/wizard-state-nr";

export function Bloc4LigneDuTemps() {
  const { state } = useTaeForm();
  const b = state.bloc2;
  const slots = b.documentSlots;

  const orderedIds = useMemo(() => slots.map((s) => s.slotId) as DocumentSlotId[], [slots]);

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const np = normalizeLigneDuTempsPayload(nonRedactionLignePayload(state));
  const bloc3Ok = np !== null && isLigneDuTempsStep3Complete(np);

  if (!blueprintGate || !bloc3Ok) {
    return <p className="text-sm leading-relaxed text-muted">{NR_LIGNE_TEMPS_GATE_PRE_DOCS}</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Aucun document n&apos;est requis pour le comportement sélectionné.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="icon-lead rounded-xl border-l-4 border-accent bg-surface py-3.5 pl-4 pr-4 text-sm text-steel shadow-sm ring-1 ring-border/40">
        <span
          className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-accent"
          aria-hidden="true"
        >
          info
        </span>
        <span className="min-w-0 leading-relaxed">{NR_LIGNE_TEMPS_BLOC4_INFO}</span>
      </div>

      <DocumentSlotsAccordionProvider initialExpandedSlotId={orderedIds[0]!}>
        <DocumentSlotsAccordionSync orderedIds={orderedIds} />
        <div className="space-y-3">
          {orderedIds.map((slotId, idx) => (
            <DocumentSlotPanel
              key={slotId}
              slotId={slotId}
              slotIndex={idx}
              orderedIds={orderedIds}
            />
          ))}
        </div>
      </DocumentSlotsAccordionProvider>

      <div className="icon-lead rounded-xl border-l-4 border-warning bg-warning/[0.07] py-3.5 pl-4 pr-4 text-sm text-steel shadow-sm ring-1 ring-warning/15">
        <span
          className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-warning"
          aria-hidden="true"
        >
          warning
        </span>
        <span className="min-w-0 leading-relaxed">
          Vous devez détenir les droits nécessaires pour publier ces documents.
        </span>
      </div>
    </div>
  );
}
