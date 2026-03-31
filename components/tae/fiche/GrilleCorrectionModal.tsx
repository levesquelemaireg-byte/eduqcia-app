"use client";

import { SimpleModal } from "@/components/ui/SimpleModal";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import { MODALE_OUTIL_EVALUATION_TITRE } from "@/lib/ui/ui-copy";

type Props = {
  open: boolean;
  onClose: () => void;
  outilEvaluation: string | null;
  grilleForModal: GrilleEntry | null;
};

/** Même contenu que la modale outil d’évaluation du Bloc 2 (`Bloc2GrilleAndModals`). */
export function GrilleCorrectionModal({ open, onClose, outilEvaluation, grilleForModal }: Props) {
  return (
    <SimpleModal
      open={open}
      title={MODALE_OUTIL_EVALUATION_TITRE}
      onClose={onClose}
      fitContentHeight
      panelClassName="max-w-[min(100vw-2rem,740px)]"
      titleStyle="info-help"
    >
      {!outilEvaluation ? (
        <p className="text-muted">Aucun outil d’évaluation associé.</p>
      ) : (
        <div className="flex w-full min-w-0 justify-center overflow-x-clip overflow-y-visible">
          <GrilleEvalTable
            entry={grilleForModal}
            outilEvaluationId={outilEvaluation}
            viewport="comfort"
          />
        </div>
      )}
    </SimpleModal>
  );
}
