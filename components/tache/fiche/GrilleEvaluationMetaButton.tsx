"use client";

import { useMemo, useState } from "react";
import { GrilleCorrectionModal } from "@/components/tache/fiche/GrilleCorrectionModal";
import { FICHE_META_PILL_CLASS } from "@/components/tache/fiche/MetaPill";
import { useGrilles } from "@/components/tache/wizard/bloc2/useBloc2Data";
import { cn } from "@/lib/utils/cn";

type Props = {
  outilEvaluation: string | null;
  /** Afficher le bouton (comportement choisi). */
  visible: boolean;
};

/**
 * Pastille `table_eye` sous la consigne — ouvre la même modale que « Voir la grille de correction »
 * (Bloc 2).
 */
export function GrilleEvaluationMetaButton({ outilEvaluation, visible }: Props) {
  const [open, setOpen] = useState(false);
  const grilles = useGrilles();
  const grilleForModal = useMemo(() => {
    if (!outilEvaluation || !grilles) return null;
    return grilles.find((g) => g.id === outilEvaluation) ?? null;
  }, [outilEvaluation, grilles]);

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        disabled={!outilEvaluation}
        onClick={() => setOpen(true)}
        className={cn(
          FICHE_META_PILL_CLASS,
          "!gap-0 !px-0 min-h-8 w-8 shrink-0 justify-center self-stretch py-0",
          "cursor-pointer transition-colors hover:bg-panel-alt/90",
          !outilEvaluation && "cursor-not-allowed opacity-50 hover:bg-panel-alt",
        )}
        aria-label="Voir la grille de correction"
      >
        <span className="material-symbols-outlined text-[0.9em] text-accent" aria-hidden="true">
          table_eye
        </span>
      </button>
      <GrilleCorrectionModal
        open={open}
        onClose={() => setOpen(false)}
        outilEvaluation={outilEvaluation}
        grilleForModal={grilleForModal}
      />
    </>
  );
}
