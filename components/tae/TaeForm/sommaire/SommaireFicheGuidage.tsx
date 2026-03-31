import { SkeletonGuidageNarrow } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";

type Props = {
  guidageHtml: string;
};

export function SommaireFicheGuidage({ guidageHtml }: Props) {
  return (
    <section aria-labelledby="sommaire-guidage">
      <h4
        id="sommaire-guidage"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span
          className="material-symbols-outlined text-[1em]"
          aria-hidden="true"
          title={materialIconTooltip("tooltip_2")}
        >
          tooltip_2
        </span>
        Guidage
      </h4>
      {htmlHasMeaningfulText(guidageHtml) ? (
        <div
          className="mt-2 text-sm leading-relaxed text-steel [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-4"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: guidageHtml }}
        />
      ) : (
        <SkeletonGuidageNarrow />
      )}
    </section>
  );
}
