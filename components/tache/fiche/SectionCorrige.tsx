import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import { sanitize } from "@/lib/fiche/helpers";
import { SkeletonCorrigeBlock } from "@/components/tache/fiche/FicheSkeletons";
import { FICHE_SECTION_BODY_INSET, FICHE_SECTION_TITLE_CLASS } from "@/lib/ui/fiche-layout";

type Props = {
  corrige: string;
};

export function SectionCorrige({ corrige }: Props) {
  const ok = hasFicheContent(corrige);

  return (
    <section>
      <h3 className={FICHE_SECTION_TITLE_CLASS}>
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          task_alt
        </span>
        Corrigé
      </h3>
      {ok ? (
        <div
          className={`${FICHE_SECTION_BODY_INSET} text-base font-medium leading-relaxed text-error [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4`}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: sanitize(corrige) }}
        />
      ) : (
        <div className={FICHE_SECTION_BODY_INSET}>
          <SkeletonCorrigeBlock />
        </div>
      )}
    </section>
  );
}
