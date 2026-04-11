"use client";

import type { ConsigneData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";

type Props = { data: ConsigneData; mode: FicheMode };

/**
 * Consigne de la tâche — HTML résolu et sanitisé.
 * Amorce documentaire affichée séparément (mode lecture/sommaire).
 */
export function SectionConsigne({ data, mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="quiz">Consigne</SectionLabel>

      <ContentBlock
        html={data.html}
        className="text-xl font-semibold leading-relaxed tracking-tight text-deep md:text-2xl [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
        clamp={mode === "thumbnail" ? 3 : undefined}
      />

      {data.amorce && mode !== "thumbnail" ? (
        <p className="mt-3 text-sm italic text-steel">{data.amorce}</p>
      ) : null}
    </section>
  );
}
