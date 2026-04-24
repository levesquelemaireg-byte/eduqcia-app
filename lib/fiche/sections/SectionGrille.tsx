"use client";

import type { GrilleData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { GrilleEvalTable } from "@/components/tache/grilles/GrilleEvalTable";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: GrilleData; mode: FicheMode };

/** Grille d'évaluation — rendu inline du tableau de barème. */
export function SectionGrille({ data, mode: _mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon={ICONES_METIER.comportement}>Grille d&apos;évaluation</SectionLabel>
      <div className={FICHE_SECTION_BODY_INSET}>
        <GrilleEvalTable
          entry={data.entry}
          outilEvaluationId={data.outilEvaluationId}
          viewport="comfort"
        />
      </div>
    </section>
  );
}
