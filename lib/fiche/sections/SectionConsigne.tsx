"use client";

import type { ConsigneData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";

type Props = { data: ConsigneData; mode: FicheMode };

/** Consigne de la tâche — un seul bloc HTML (amorce documentaire incluse). */
export function SectionConsigne({ data, mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="quiz">Consigne</SectionLabel>

      <ContentBlock
        html={data.html}
        className="text-xl font-semibold leading-relaxed tracking-tight text-deep md:text-2xl [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
        clamp={mode === "thumbnail" ? 3 : undefined}
      />
    </section>
  );
}
