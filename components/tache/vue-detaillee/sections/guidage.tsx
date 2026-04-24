"use client";

import type { GuidageData } from "@/lib/fiche/selectors/tache/guidage";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { ContentBlock } from "@/lib/fiche/primitives/ContentBlock";
import { FICHE_SECTION_TITLE_GUIDAGE } from "@/lib/ui/ui-copy";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = { data: GuidageData };

/**
 * Section Guidage de la vue détaillée tâche.
 * Contenu TipTap en italique, couleur steel.
 */
export function SectionGuidage({ data }: Props) {
  return (
    <section>
      <SectionLabel icon={ICONES_METIER.guidage}>{FICHE_SECTION_TITLE_GUIDAGE}</SectionLabel>
      <ContentBlock html={data.html} className="italic text-steel" />
    </section>
  );
}
