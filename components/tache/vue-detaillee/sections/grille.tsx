"use client";

import { useMemo, useState, useId } from "react";
import type { GrilleData } from "@/lib/fiche/selectors/tache/grille";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import { useGrilles } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import { FICHE_SECTION_TITLE_GRILLE } from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = { data: GrilleData };

/**
 * Section Grille d'évaluation ministérielle de la vue détaillée tâche.
 * Accordéon collapsed par défaut — le composant grille est une boîte noire.
 */
export function SectionGrille({ data }: Props) {
  const [deplie, setDeplie] = useState(false);
  const contentId = useId();
  const grilles = useGrilles();

  const entry = useMemo(
    () => grilles?.find((g) => g.id === data.outilEvaluationId) ?? null,
    [grilles, data.outilEvaluationId],
  );

  return (
    <section>
      <SectionLabel icon="table">{FICHE_SECTION_TITLE_GRILLE}</SectionLabel>

      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border-[0.5px] border-border bg-panel px-4 py-3 text-left text-sm font-medium text-deep transition-colors duration-150 hover:border-border-secondary"
        aria-expanded={deplie}
        aria-controls={contentId}
        onClick={() => setDeplie((v) => !v)}
      >
        <span>{deplie ? "Masquer" : "Afficher"}</span>
        <span
          className={cn(
            "material-symbols-outlined text-[16px] text-muted transition-transform duration-150",
            deplie && "rotate-180",
          )}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {deplie ? (
        <div id={contentId} className="mt-3">
          <GrilleEvalTable
            entry={entry}
            outilEvaluationId={data.outilEvaluationId}
            viewport="comfort"
          />
        </div>
      ) : null}
    </section>
  );
}
