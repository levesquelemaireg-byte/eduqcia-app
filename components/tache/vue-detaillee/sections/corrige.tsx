"use client";

import type { CorrigeData } from "@/lib/fiche/selectors/tache/corrige";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";
import { FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE } from "@/lib/ui/ui-copy";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: CorrigeData };

/**
 * Section Production attendue de la vue détaillée tâche.
 * Contenu TipTap en couleur corrigé (rouge stylo professeur).
 * Notes au correcteur : hors scope v1.
 */
export function SectionCorrige({ data }: Props) {
  return (
    <section>
      <SectionLabel icon={ICONES_METIER.corrige}>
        {FICHE_SECTION_TITLE_PRODUCTION_ATTENDUE}
      </SectionLabel>
      <ContentBlock html={data.html} className="text-corrige" />
    </section>
  );
}
