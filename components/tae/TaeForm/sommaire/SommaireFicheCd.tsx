import { SkeletonMillerCd } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import type { CdSelection } from "@/lib/types/fiche";
import { WIZARD_REFERENTIEL_CD_INDISPO } from "@/lib/ui/ui-copy";

type Props = {
  discipline: DisciplineCode;
  cdSlice: CdSelection | null;
};

export function SommaireFicheCd({ discipline, cdSlice }: Props) {
  return (
    <section aria-labelledby="sommaire-cd">
      <h4
        id="sommaire-cd"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span
          className="material-symbols-outlined text-[1em]"
          aria-hidden="true"
          title={materialIconTooltip("license")}
        >
          license
        </span>
        Compétence disciplinaire
      </h4>
      {discipline === "geo" ? (
        <p className="mt-3 text-sm text-muted">{WIZARD_REFERENTIEL_CD_INDISPO}</p>
      ) : cdSlice ? (
        <div className="mt-3 space-y-0.5">
          <p className="text-sm font-semibold text-deep">{cdSlice.competence}</p>
          <div className="ml-4 border-l border-border pl-3">
            <p className="text-sm text-steel">{cdSlice.composante}</p>
            <div className="mt-0.5 ml-4 border-l border-border pl-3">
              <p className="flex items-center gap-1.5 text-sm font-medium text-deep">
                {cdSlice.critere}
                <span
                  className="material-symbols-outlined text-[0.9em] text-success"
                  aria-hidden="true"
                >
                  check
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <SkeletonMillerCd />
      )}
    </section>
  );
}
