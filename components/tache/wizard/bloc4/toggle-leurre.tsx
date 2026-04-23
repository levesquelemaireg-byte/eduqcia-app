"use client";

import { useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { WarningModal } from "@/components/ui/WarningModal";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  SECTION_B_DOC_LEURRE_CONFIRMATION_ANNULER,
  SECTION_B_DOC_LEURRE_CONFIRMATION_CONFIRMER,
  SECTION_B_DOC_LEURRE_CONFIRMATION_CORPS,
  SECTION_B_DOC_LEURRE_CONFIRMATION_TITRE,
  SECTION_B_DOC_LEURRE_LABEL,
  SECTION_B_DOC_LEURRE_TOOLTIP,
  SECTION_B_DOC_PERTINENT_LABEL,
  SECTION_B_DOC_PERTINENT_TOOLTIP,
} from "@/lib/ui/ui-copy";

type Props = { slotId: DocumentSlotId };

export function ToggleLeurre({ slotId }: Props) {
  const { state, dispatch } = useTacheForm();
  const slot = state.bloc4.documents[slotId];
  const estLeurre = slot?.estLeurre ?? false;
  const aDesAssociations = (slot?.casesAssociees.length ?? 0) > 0;

  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const appliquerLeurre = (value: boolean) => {
    dispatch({ type: "SET_DOCUMENT_LEURRE", slotId, value });
  };

  const demanderLeurre = () => {
    if (aDesAssociations) {
      setConfirmOpen(true);
    } else {
      appliquerLeurre(true);
    }
  };

  const confirmer = () => {
    appliquerLeurre(true);
    setConfirmOpen(false);
  };

  return (
    <fieldset className="space-y-2">
      <LabelWithInfo
        labelText="Pertinence du document"
        onInfoClick={() => setHelpOpen(true)}
        showAsterisk={false}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <label
          className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${
            estLeurre
              ? "border-border bg-surface text-muted"
              : "border-accent/60 bg-accent/5 text-deep ring-1 ring-accent/20"
          }`}
        >
          <input
            type="radio"
            name={`pertinence-${slotId}`}
            checked={!estLeurre}
            onChange={() => appliquerLeurre(false)}
            className="mt-0.5 shrink-0"
          />
          <span className="flex-1">
            <span className="block font-semibold">{SECTION_B_DOC_PERTINENT_LABEL}</span>
            <span className="mt-0.5 block text-xs text-muted">
              Le document alimente une ou plusieurs cases du schéma.
            </span>
          </span>
        </label>
        <label
          className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${
            estLeurre
              ? "border-warning/50 bg-warning/10 text-deep ring-1 ring-warning/25"
              : "border-border bg-surface text-muted"
          }`}
        >
          <input
            type="radio"
            name={`pertinence-${slotId}`}
            checked={estLeurre}
            onChange={demanderLeurre}
            className="mt-0.5 shrink-0"
          />
          <span className="flex-1">
            <span className="block font-semibold">{SECTION_B_DOC_LEURRE_LABEL}</span>
            <span className="mt-0.5 block text-xs text-muted">
              Document authentique hors cadre des aspects ciblés.
            </span>
          </span>
        </label>
      </div>

      <SimpleModal
        open={helpOpen}
        title="Pertinence du document"
        onClose={() => setHelpOpen(false)}
        titleStyle="info-help"
      >
        <div className="space-y-3 text-sm leading-relaxed text-deep">
          <p>
            <strong>{SECTION_B_DOC_PERTINENT_LABEL}.</strong> {SECTION_B_DOC_PERTINENT_TOOLTIP}
          </p>
          <p>
            <strong>{SECTION_B_DOC_LEURRE_LABEL}.</strong> {SECTION_B_DOC_LEURRE_TOOLTIP}
          </p>
        </div>
      </SimpleModal>

      <WarningModal
        open={confirmOpen}
        title={SECTION_B_DOC_LEURRE_CONFIRMATION_TITRE}
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-semibold text-deep hover:bg-panel-alt"
            >
              {SECTION_B_DOC_LEURRE_CONFIRMATION_ANNULER}
            </button>
            <button
              type="button"
              onClick={confirmer}
              className="inline-flex h-10 items-center justify-center rounded-md bg-warning px-4 text-sm font-semibold text-surface hover:bg-warning/90"
            >
              {SECTION_B_DOC_LEURRE_CONFIRMATION_CONFIRMER}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-deep">
          {SECTION_B_DOC_LEURRE_CONFIRMATION_CORPS}
        </p>
      </WarningModal>
    </fieldset>
  );
}
