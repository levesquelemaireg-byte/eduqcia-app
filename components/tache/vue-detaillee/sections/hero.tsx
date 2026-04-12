"use client";

import type { HeroData } from "@/lib/fiche/selectors/tache/hero";
import { IconBadge } from "@/lib/fiche/primitives/IconBadge";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";

type Props = { data: HeroData };

/**
 * Hero de la vue détaillée tâche.
 * IconBadge 52px boxed + overline MetaChip OI + h1 énoncé fusionné + comportement attendu.
 * Pas de SectionLabel — le hero est la tête de la fiche, pas une section parmi d'autres.
 */
export function SectionHero({ data }: Props) {
  return (
    <section className="flex items-start gap-4">
      <IconBadge glyph={data.oiGlyph} mode="lecture" boxed size={52} />

      <div className="min-w-0 flex-1">
        {/* Overline — pill OI */}
        <div className="mb-2">
          <MetaChip icon="psychology" label={data.oiLabel} mode="lecture" />
        </div>

        {/* Énoncé h1 — amorce + consigne fusionnées */}
        <h1
          className="text-[21px] font-medium leading-[1.45] text-deep"
          dangerouslySetInnerHTML={{ __html: data.enonce }}
        />

        {/* Comportement attendu */}
        {data.comportementAttendu ? (
          <p className="mt-2 text-[13px] leading-normal text-steel">{data.comportementAttendu}</p>
        ) : null}
      </div>
    </section>
  );
}
