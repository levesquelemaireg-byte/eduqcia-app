"use client";

import type { HeroData } from "@/lib/fiche/selectors/tache/hero";
import { IconBadge } from "@/lib/fiche/primitives/IconBadge";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { TIPTAP_HTML_STYLES } from "@/lib/fiche/primitives/tiptap-html-styles";

type Props = { data: HeroData; heroRef?: React.Ref<HTMLHeadingElement> };

/**
 * Hero de la vue détaillée tâche.
 * IconBadge 52px boxed + overline MetaChip OI + h1 énoncé fusionné + comportement attendu.
 * Pas de SectionLabel — le hero est la tête de la fiche, pas une section parmi d'autres.
 */
export function SectionHero({ data, heroRef }: Props) {
  return (
    <section className="flex items-start gap-3 md:gap-4">
      {/* IconBadge : 40px mobile, 52px desktop */}
      <div className="shrink-0">
        <div className="md:hidden">
          <IconBadge glyph={data.oiGlyph} mode="lecture" boxed size={40} />
        </div>
        <div className="hidden md:block">
          <IconBadge glyph={data.oiGlyph} mode="lecture" boxed size={52} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {/* Overline — pill OI + comportement attendu */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <MetaChip icon="psychology" label={data.oiLabel} mode="lecture" />
          {data.comportementAttendu ? (
            <span className="inline-flex min-h-8 items-center rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
              {data.comportementAttendu}
            </span>
          ) : null}
        </div>

        {/* Énoncé h1 — 19px mobile, 21px desktop */}
        <h1
          ref={heroRef}
          tabIndex={-1}
          className={`text-[19px] font-medium leading-relaxed text-deep outline-none md:text-[21px] ${TIPTAP_HTML_STYLES}`}
          dangerouslySetInnerHTML={{ __html: data.enonce }}
        />
      </div>
    </section>
  );
}
