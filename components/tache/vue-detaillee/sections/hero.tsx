"use client";

import type { HeroData } from "@/lib/fiche/selectors/tache/hero";
import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { TIPTAP_HTML_STYLES } from "@/lib/fiche/primitives/tiptap-html-styles";

type Props = { data: HeroData; heroRef?: React.Ref<HTMLHeadingElement> };

/**
 * Hero de la vue détaillée tâche.
 * Overline MetaChip OI (glyphe spécifique) + pill comportement (icône psychology) + h1 énoncé.
 * L'IconBadge OI vit désormais dans le TacheRail (premier élément).
 */
export function SectionHero({ data, heroRef }: Props) {
  return (
    <section>
      {/* Overline — pill OI (glyphe spécifique) + comportement attendu (icône OI générique) */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <MetaChip icon={data.oiGlyph} label={data.oiLabel} />
        {data.comportementAttendu ? (
          <MetaChip icon="psychology" label={data.comportementAttendu} />
        ) : null}
      </div>

      {/* Énoncé h1 — 19px mobile, 21px desktop */}
      <h1
        ref={heroRef}
        tabIndex={-1}
        className={`text-[19px] font-medium leading-relaxed text-deep outline-none md:text-[21px] ${TIPTAP_HTML_STYLES}`}
        dangerouslySetInnerHTML={{ __html: data.enonce }}
      />
    </section>
  );
}
