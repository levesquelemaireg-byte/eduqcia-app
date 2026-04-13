"use client";

import { useMemo } from "react";
import type { GrilleData } from "@/lib/fiche/selectors/tache/grille";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import { useGrilles } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import { FICHE_SECTION_TITLE_GRILLE } from "@/lib/ui/ui-copy";

type Props = { data: GrilleData };

/**
 * Section Grille d'évaluation ministérielle de la vue détaillée tâche.
 * Affichée directement (pas d'accordéon), dans un wrapper fond blanc bordé
 * identique aux DocCards.
 */
export function SectionGrille({ data }: Props) {
  const grilles = useGrilles();

  const entry = useMemo(
    () => grilles?.find((g) => g.id === data.outilEvaluationId) ?? null,
    [grilles, data.outilEvaluationId],
  );

  return (
    <section>
      <SectionLabel icon="table">{FICHE_SECTION_TITLE_GRILLE}</SectionLabel>

      <div className="overflow-hidden rounded-xl border-[0.5px] border-border bg-panel p-4">
        <GrilleEvalTable
          entry={entry}
          outilEvaluationId={data.outilEvaluationId}
          viewport="comfort"
        />
      </div>
    </section>
  );
}
