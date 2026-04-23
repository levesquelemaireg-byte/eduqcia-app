"use client";

import { WarningModal } from "@/components/ui/WarningModal";
import type { BlueprintSlice } from "@/components/tache/wizard/FormState";
import { DISCIPLINE_LABEL, NIVEAUX } from "@/components/tache/wizard/bloc2/constants";
import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import type { ComportementAttenduJson, OiEntryJson } from "@/lib/types/oi";
import {
  BLOC2_BLUEPRINT_LOCKED_LBL_COMPORTEMENT,
  BLOC2_BLUEPRINT_LOCKED_LBL_DISCIPLINE,
  BLOC2_BLUEPRINT_LOCKED_LBL_DOCUMENTS,
  BLOC2_BLUEPRINT_LOCKED_LBL_NB_LIGNES,
  BLOC2_BLUEPRINT_LOCKED_LBL_NIVEAU,
  BLOC2_BLUEPRINT_LOCKED_LBL_OI,
  BLOC2_BLUEPRINT_LOCKED_TITLE,
  BLOC2_UNLOCK_CTA,
  BLOC2_UNLOCK_MODAL_BODY,
  BLOC2_UNLOCK_MODAL_CANCEL,
  BLOC2_UNLOCK_MODAL_CONFIRM,
  BLOC2_UNLOCK_MODAL_TITLE,
} from "@/lib/ui/ui-copy";

type Props = {
  blueprint: BlueprintSlice;
  selectedOi: OiEntryJson | undefined;
  selectedComportement: ComportementAttenduJson | undefined;
  /** Parcours non rédactionnel : masquer le rappel « nombre de lignes ». */
  hideNbLignesSummary?: boolean;
  unlockModalOpen: boolean;
  onUnlockModalOpenChange: (open: boolean) => void;
  onConfirmUnlock: () => void;
};

export function BlueprintLockedView({
  blueprint: b,
  selectedOi,
  selectedComportement,
  hideNbLignesSummary = false,
  unlockModalOpen,
  onUnlockModalOpenChange,
  onConfirmUnlock,
}: Props) {
  const parcours = resoudreParcours(b.typeTache);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-panel-alt/60 p-4 text-sm">
        <p className="font-semibold text-deep">{BLOC2_BLUEPRINT_LOCKED_TITLE}</p>
        <ul className="mt-3 space-y-2 text-muted">
          <li>
            <span className="font-medium text-deep">{BLOC2_BLUEPRINT_LOCKED_LBL_NIVEAU}</span>{" "}
            {NIVEAUX.find((n) => n.value === b.niveau)?.label ?? b.niveau}
          </li>
          <li>
            <span className="font-medium text-deep">{BLOC2_BLUEPRINT_LOCKED_LBL_DISCIPLINE}</span>{" "}
            {b.discipline
              ? (DISCIPLINE_LABEL[b.discipline as DisciplineCode] ?? b.discipline)
              : "—"}
          </li>
          <li>
            <span className="font-medium text-deep">Type de tâche :</span> {parcours.label}
          </li>
          {parcours.aspectsRequis && b.aspectA && b.aspectB ? (
            <li>
              <span className="font-medium text-deep">Aspects de société :</span>{" "}
              {ASPECT_LABEL[b.aspectA]}, {ASPECT_LABEL[b.aspectB]}
            </li>
          ) : null}
          {parcours.oiPertinente ? (
            <>
              <li>
                <span className="font-medium text-deep">{BLOC2_BLUEPRINT_LOCKED_LBL_OI}</span>{" "}
                {selectedOi?.titre ?? b.oiId}
              </li>
              <li>
                <span className="font-medium text-deep">
                  {BLOC2_BLUEPRINT_LOCKED_LBL_COMPORTEMENT}
                </span>{" "}
                {selectedComportement?.enonce ?? b.comportementId}
              </li>
            </>
          ) : null}
          {hideNbLignesSummary ? null : (
            <li>
              <span className="font-medium text-deep">{BLOC2_BLUEPRINT_LOCKED_LBL_NB_LIGNES}</span>{" "}
              {b.nbLignes != null ? `${b.nbLignes} ligne(s)` : "—"}
            </li>
          )}
          <li>
            <span className="font-medium text-deep">{BLOC2_BLUEPRINT_LOCKED_LBL_DOCUMENTS}</span>{" "}
            {b.nbDocuments != null ? b.nbDocuments : "—"}
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={() => onUnlockModalOpenChange(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm font-semibold text-deep hover:bg-panel-alt"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          lock_open
        </span>
        {BLOC2_UNLOCK_CTA}
      </button>

      <WarningModal
        open={unlockModalOpen}
        title={BLOC2_UNLOCK_MODAL_TITLE}
        onClose={() => onUnlockModalOpenChange(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => onUnlockModalOpenChange(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-panel px-3 py-2 text-sm font-semibold text-deep hover:bg-panel-alt"
            >
              {BLOC2_UNLOCK_MODAL_CANCEL}
            </button>
            <button
              type="button"
              onClick={onConfirmUnlock}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-success px-3 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              {BLOC2_UNLOCK_MODAL_CONFIRM}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC2_UNLOCK_MODAL_BODY}</p>
      </WarningModal>
    </div>
  );
}
