import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import { sanitize } from "@/lib/fiche/helpers";
import { FICHE_SECTION_BODY_INSET, FICHE_SECTION_TITLE_CLASS } from "@/lib/ui/fiche-layout";

type Props = {
  guidage: string;
};

export function SectionGuidage({ guidage }: Props) {
  const ok = hasFicheContent(guidage);
  if (!ok) return null;

  return (
    <section>
      <h3 className={FICHE_SECTION_TITLE_CLASS}>
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          tooltip_2
        </span>
        Guidage
      </h3>
      <div
        className={`${FICHE_SECTION_BODY_INSET} text-sm leading-relaxed text-steel [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-4`}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: sanitize(guidage) }}
      />
    </section>
  );
}
