import { STEP_DESCRIPTIONS } from "@/lib/ui/ui-copy";

type Props = {
  stepLabel: string;
  stepIndex: number;
  comportementId: string | null;
  /** Description par défaut depuis step-meta.ts — utilisée si aucune description contextuelle. */
  defaultDescription?: string;
};

export function StepHeader({ stepLabel, stepIndex, comportementId, defaultDescription }: Props) {
  const stepDescriptions = STEP_DESCRIPTIONS[stepIndex];
  const description = stepDescriptions
    ? (comportementId && stepDescriptions[comportementId]) ?? stepDescriptions["default"] ?? defaultDescription ?? null
    : defaultDescription ?? null;

  return (
    <>
      <h2 id="tae-step-heading" className="text-xl font-semibold tracking-tight text-deep">
        {stepLabel}
      </h2>
      {description ? (
        <p className="mt-2 max-w-none text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
    </>
  );
}
