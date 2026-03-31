import { SkeletonConsigne } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";
import { htmlHasMeaningfulText, resolveConsigneHtmlForDisplay } from "@/lib/tae/consigne-helpers";
import { prepareNonRedactionConsigneForTeacherDisplay } from "@/lib/tae/non-redaction/ligne-du-temps-payload";

type Props = {
  consigneHtml: string;
  documentSlotCount?: number;
};

export function SommaireFicheConsigne({ consigneHtml, documentSlotCount }: Props) {
  return (
    <section aria-labelledby="sommaire-consigne">
      <h4
        id="sommaire-consigne"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          quiz
        </span>
        Consigne
      </h4>
      <div className="mt-3 border-l-4 border-accent pl-4">
        {htmlHasMeaningfulText(consigneHtml) ? (
          <div
            className="text-lg font-semibold leading-relaxed text-deep [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-4"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: resolveConsigneHtmlForDisplay(
                prepareNonRedactionConsigneForTeacherDisplay(consigneHtml),
                documentSlotCount,
              ),
            }}
          />
        ) : (
          <SkeletonConsigne />
        )}
      </div>
    </section>
  );
}
