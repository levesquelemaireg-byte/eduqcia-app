"use client";

import type { GuidageData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";

type Props = { data: GuidageData; mode: FicheMode };

/** Guidage complémentaire — HTML sanitisé. */
export function SectionGuidage({ data, mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="tooltip_2">Guidage</SectionLabel>

      <ContentBlock
        html={data.html}
        className="text-sm leading-relaxed text-steel"
        clamp={mode === "thumbnail" ? 2 : undefined}
      />
    </section>
  );
}
