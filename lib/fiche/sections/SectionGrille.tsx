"use client";

import type { GrilleData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { GrilleEvaluationMetaButton } from "@/components/tae/fiche/GrilleEvaluationMetaButton";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";

type Props = { data: GrilleData; mode: FicheMode };

/** Grille d'évaluation — bouton d'ouverture de la modale. */
export function SectionGrille({ data, mode: _mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="table">Grille d&apos;évaluation</SectionLabel>
      <div className={FICHE_SECTION_BODY_INSET}>
        <GrilleEvaluationMetaButton visible outilEvaluation={data.outilEvaluation} />
      </div>
    </section>
  );
}
