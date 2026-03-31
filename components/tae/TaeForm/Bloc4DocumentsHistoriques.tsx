"use client";

import { useMemo } from "react";

/**
 * Étape 4 — Documents historiques — BLOC4-DOCUMENTS.md
 */
import { DocumentSlotPanel } from "@/components/tae/TaeForm/bloc4";
import { DocumentSlotsAccordionProvider } from "@/components/tae/TaeForm/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tae/TaeForm/bloc4/DocumentSlotsAccordionSync";
import { getRedactionSliceForPreview, useTaeForm } from "@/components/tae/TaeForm/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { isRedactionStepComplete } from "@/lib/tae/redaction-helpers";

export function Bloc4DocumentsHistoriques() {
  const { state } = useTaeForm();
  const b = state.bloc2;
  const nb = b.nbDocuments;
  const slots = b.documentSlots;

  const orderedIds = useMemo(() => slots.map((s) => s.slotId) as DocumentSlotId[], [slots]);

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const redactionOk = isRedactionStepComplete(getRedactionSliceForPreview(state));

  if (!blueprintGate || !redactionOk) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Complétez d&apos;abord les étapes « Paramètres de la tâche » et « Consigne et production
        attendue » (étapes 2 et 3) pour accéder aux documents historiques.
      </p>
    );
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
          className="material-symbols-outlined mt-0.5 shrink-0 text-[1em] text-accent"
          aria-hidden="true"
        >
          info
        </span>
        <span className="min-w-0 leading-relaxed">
          {nb === 1
            ? "Ce comportement attendu requiert 1 document historique."
            : `Ce comportement attendu requiert ${nb} documents historiques.`}
        </span>
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
          className="material-symbols-outlined mt-0.5 shrink-0 text-[1em] text-warning"
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
