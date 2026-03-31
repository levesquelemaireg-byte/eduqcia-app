import { SkeletonCorrigeGuidage } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";

type Props = {
  corrigeHtml: string;
};

export function SommaireFicheCorrige({ corrigeHtml }: Props) {
  return (
    <section aria-labelledby="sommaire-corrige">
      <h4
        id="sommaire-corrige"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span
          className="material-symbols-outlined text-[1em]"
          aria-hidden="true"
          title={materialIconTooltip("task_alt")}
        >
          task_alt
        </span>
        Corrigé
      </h4>
      {htmlHasMeaningfulText(corrigeHtml) ? (
        <div
          className="mt-2 text-sm leading-relaxed text-steel [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-4"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: corrigeHtml }}
        />
      ) : (
        <SkeletonCorrigeGuidage />
      )}
    </section>
  );
}
