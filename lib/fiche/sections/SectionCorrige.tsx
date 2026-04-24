"use client";

import type { CorrigeData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: CorrigeData; mode: FicheMode };

/** Corrigé de la tâche — texte en error + notes correcteur optionnelles. */
export function SectionCorrige({ data, mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon={ICONES_METIER.corrige}>Corrigé</SectionLabel>

      <ContentBlock
        html={data.html}
        className={`${FICHE_SECTION_BODY_INSET} text-error`}
        clamp={mode === "thumbnail" ? 2 : undefined}
      />

      {data.notesCorrecteur && mode === "lecture" ? (
        <p
          className={`${FICHE_SECTION_BODY_INSET} mt-3 rounded-md bg-surface px-3 py-2 text-sm text-steel`}
        >
          <span className="font-semibold">Notes au correcteur : </span>
          {data.notesCorrecteur}
        </p>
      ) : null}
    </section>
  );
}
