"use client";

import { useMemo } from "react";

/**
 * Étape 4 — Documents historiques — BLOC4-DOCUMENTS.md
 */
import { DocumentSlotPanel } from "@/components/tache/wizard/bloc4";
import { DocumentSlotsAccordionProvider } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotsAccordionSync } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionSync";
import { getRedactionSliceForPreview, useTacheForm } from "@/components/tache/wizard/FormState";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import { isRedactionSliceConsigneReady } from "@/lib/tache/redaction-helpers";
import { isSchemaCd1ChapeauReady } from "@/lib/tache/schema-cd1/types";
import { BLOC4_GATE_WIZARD } from "@/lib/ui/ui-copy";

export function Bloc4DocumentsHistoriques() {
  const { state, dispatch } = useTacheForm();
  const b = state.bloc2;
  const nb = b.nbDocuments;
  const slots = b.documentSlots;
  const parcours = resoudreParcours(b.typeTache);

  const orderedIds = useMemo(() => slots.map((s) => s.slotId) as DocumentSlotId[], [slots]);

  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;
  const redactionOk =
    parcours.bloc3Type === "schema_cd1"
      ? isSchemaCd1ChapeauReady(state.bloc3.schemaCd1)
      : isRedactionSliceConsigneReady(getRedactionSliceForPreview(state));

  if (!blueprintGate || !redactionOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC4_GATE_WIZARD}</p>;
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

      {!parcours.oiPertinente && slots.length < parcours.documentsMax ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_DOCUMENT_SLOT" })}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm font-semibold text-deep hover:bg-panel-alt"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            add
          </span>
          Ajouter un document
        </button>
      ) : null}

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
