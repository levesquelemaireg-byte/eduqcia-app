"use client";

import { useMemo } from "react";
import { DocumentSlotPanel } from "@/components/tae/TaeForm/bloc4/DocumentSlotPanel";
import { DocumentSlotsAccordionProvider } from "@/components/tae/TaeForm/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tae/TaeForm/bloc4/DocumentSlotsAccordionSync";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import {
  isOrdreChronologiqueStep3ConsigneComplete,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import { OrdreChronologiqueBloc4SequenceReminder } from "@/components/tae/non-redaction/ordre-chronologique/OrdreChronologiqueBloc4SequenceReminder";
import { NR_ORDRE_BLOC4_INFO, NR_ORDRE_GATE_PRE_DOCS } from "@/lib/ui/ui-copy";
import { nonRedactionOrdrePayload } from "@/lib/tae/wizard-state-nr";

export function Bloc4OrdreChronologique() {
  const { state } = useTaeForm();
  const b = state.bloc2;
  const nb = b.nbDocuments;
  const slots = b.documentSlots;

  const orderedIds = useMemo(() => slots.map((s) => s.slotId) as DocumentSlotId[], [slots]);

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const np = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
  const bloc3Ok = np !== null && isOrdreChronologiqueStep3ConsigneComplete(np);

  if (!blueprintGate || !bloc3Ok) {
    return <p className="text-sm leading-relaxed text-muted">{NR_ORDRE_GATE_PRE_DOCS}</p>;
  }

  if (nb == null || slots.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Aucun document historique n&apos;est requis pour le comportement sélectionné. Passez à
        l&apos;étape suivante.
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
        <span className="min-w-0 leading-relaxed">{NR_ORDRE_BLOC4_INFO}</span>
      </div>

      {np ? (
        <OrdreChronologiqueBloc4SequenceReminder payload={np} orderedSlotIds={orderedIds} />
      ) : null}

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
