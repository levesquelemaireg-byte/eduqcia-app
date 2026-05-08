"use client";

import { useMemo } from "react";
import { DocumentSlotPanel } from "@/components/tache/wizard/bloc4/DocumentSlotPanel";
import { DocumentSlotsAccordionProvider } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionSync";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  isManifestationsStep3Complete,
  normalizeManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import { nonRedactionManifestationsPayload } from "@/lib/tache/wizard-state-nr";
import {
  NR_MANIFESTATIONS_BLOC4_INFO_51,
  NR_MANIFESTATIONS_BLOC4_INFO_52,
  NR_MANIFESTATIONS_GATE_PRE_DOCS,
} from "@/lib/ui/ui-copy";

export function Bloc4Manifestations() {
  const { state } = useTacheForm();
  const b = state.bloc2;
  const slots = b.documentSlots;

  const orderedIds = useMemo(() => slots.map((s) => s.slotId) as DocumentSlotId[], [slots]);

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const np = normalizeManifestationsPayload(nonRedactionManifestationsPayload(state));
  const bloc3Ok = np !== null && isManifestationsStep3Complete(np);

  if (!blueprintGate || !bloc3Ok) {
    return <p className="text-sm leading-relaxed text-muted">{NR_MANIFESTATIONS_GATE_PRE_DOCS}</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Aucun document n&apos;est requis pour le comportement sélectionné.
      </p>
    );
  }

  const info =
    np?.comportementId === "5.1"
      ? NR_MANIFESTATIONS_BLOC4_INFO_51
      : NR_MANIFESTATIONS_BLOC4_INFO_52;

  return (
    <div className="space-y-8">
      <div className="icon-lead rounded-xl border-l-4 border-accent bg-surface py-3.5 pl-4 pr-4 text-sm text-steel shadow-sm ring-1 ring-border/40">
        <span
          className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-accent"
          aria-hidden="true"
        >
          info
        </span>
        <span className="min-w-0 leading-relaxed">{info}</span>
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
          Vous devez détenir les droits nécessaires pour publier ce document.
        </span>
      </div>
    </div>
  );
}
