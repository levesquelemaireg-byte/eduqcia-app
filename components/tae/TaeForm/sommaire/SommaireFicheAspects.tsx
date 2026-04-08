import { SkeletonAspectPills } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import { BLOC7_ASPECTS_LABEL } from "@/lib/ui/ui-copy";

type Props = {
  /** Libellés français des aspects cochés. */
  selectedLabels: string[];
};

export function SommaireFicheAspects({ selectedLabels }: Props) {
  return (
    <section aria-labelledby="sommaire-aspects">
      <h4
        id="sommaire-aspects"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span
          className="material-symbols-outlined text-[1em]"
          aria-hidden="true"
          title={materialIconTooltip("deployed_code")}
        >
          deployed_code
        </span>
        {BLOC7_ASPECTS_LABEL}
      </h4>
      {selectedLabels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedLabels.map((aspect) => (
            <span
              key={aspect}
              className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent"
            >
              {aspect}
            </span>
          ))}
        </div>
      ) : (
        <SkeletonAspectPills />
      )}
    </section>
  );
}
