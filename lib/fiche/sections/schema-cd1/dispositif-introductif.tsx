"use client";

import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";
import type { FicheMode } from "@/lib/fiche/types";
import type { DispositifIntroductifData } from "@/lib/fiche/selectors/tache/dispositif-introductif";
import { SECTION_B_DEMARCHE_LABEL, SECTION_B_PREAMBULE_LABEL } from "@/lib/ui/ui-copy";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: DispositifIntroductifData; mode: FicheMode };

/**
 * Section Sommaire — dispositif introductif Section B.
 * Préambule (texte normal) + chapeau (gras) + démarche (liste ordonnée).
 */
export function SectionDispositifIntroductif({ data, mode: _mode }: Props) {
  return (
    <section className="px-5 pt-4 pb-4 space-y-4">
      {data.preambuleHtml ? (
        <div>
          <SectionLabel icon={ICONES_METIER.discipline}>{SECTION_B_PREAMBULE_LABEL}</SectionLabel>
          <ContentBlock html={data.preambuleHtml} className="text-sm leading-relaxed text-steel" />
        </div>
      ) : null}

      <div>
        <SectionLabel icon={ICONES_METIER.consigne}>Consigne de caractérisation</SectionLabel>
        <ContentBlock
          html={data.chapeauHtml}
          className="text-base leading-relaxed tracking-tight text-deep"
        />
      </div>

      <div>
        <SectionLabel icon={ICONES_METIER.guidage}>{SECTION_B_DEMARCHE_LABEL}</SectionLabel>
        <ContentBlock
          html={data.demarcheHtml}
          className="text-sm italic leading-relaxed text-muted [&>ol]:list-decimal [&>ol]:pl-5"
        />
      </div>
    </section>
  );
}
