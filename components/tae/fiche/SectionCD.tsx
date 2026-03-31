import type { CdSelection } from "@/lib/types/fiche";
import { SkeletonCDTree } from "@/components/tae/fiche/FicheSkeletons";
import { FICHE_SECTION_BODY_INSET, FICHE_SECTION_TITLE_CLASS } from "@/lib/ui/fiche-layout";

type Props = {
  cd: CdSelection | null;
};

export function SectionCD({ cd }: Props) {
  return (
    <section>
      <h3 className={FICHE_SECTION_TITLE_CLASS}>
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          license
        </span>
        Compétence disciplinaire
      </h3>
      {cd ? (
        <div className={`${FICHE_SECTION_BODY_INSET} space-y-0.5`}>
          <p className="text-sm font-semibold text-deep">{cd.competence}</p>
          <div className="ml-4 border-l border-border pl-3">
            <p className="text-sm text-steel">{cd.composante}</p>
            <div className="mt-0.5 ml-4 border-l border-border pl-3">
              <p className="text-sm font-medium text-deep">{cd.critere}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={FICHE_SECTION_BODY_INSET}>
          <SkeletonCDTree />
        </div>
      )}
    </section>
  );
}
