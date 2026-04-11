"use client";

import type { CompetenceData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";

type Props = { data: CompetenceData; mode: FicheMode };

/** Compétence disciplinaire — arbre 3 niveaux. */
export function SectionCD({ data, mode: _mode }: Props) {
  const { cd } = data;

  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="license">Compétence disciplinaire</SectionLabel>
      <div className={`${FICHE_SECTION_BODY_INSET} space-y-0.5`}>
        <p className="text-sm font-semibold text-deep">{cd.competence}</p>
        <div className="ml-4 border-l border-border pl-3">
          <p className="text-sm text-steel">{cd.composante}</p>
          <div className="mt-0.5 ml-4 border-l border-border pl-3">
            <p className="text-sm font-medium text-deep">{cd.critere}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
