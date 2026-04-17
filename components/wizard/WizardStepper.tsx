"use client";

import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import { cn } from "@/lib/utils/cn";

export type WizardStepDefinition = {
  id: string;
  number: number;
  stepperLine: string;
  icons: readonly string[];
};

type WizardStepperProps = {
  steps: readonly WizardStepDefinition[];
  currentStep: number;
  /** Étape la plus haute atteinte — les étapes entre currentStep et ce seuil restent cliquables. */
  highestReachedStep?: number;
  /** Clic sur une étape déjà complétée — index cible. */
  onCompletedStepClick: (index: number) => void;
  className?: string;
  navAriaLabel: string;
};

/**
 * Barre d’étapes horizontale — même structure visuelle que le wizard « Créer une tâche »
 * (`docs/WORKFLOWS.md` — TAE stepper).
 */
export function WizardStepper({
  steps,
  currentStep,
  highestReachedStep,
  onCompletedStepClick,
  className,
  navAriaLabel,
}: WizardStepperProps) {
  const lastIndex = steps.length - 1;
  const ceiling = highestReachedStep ?? currentStep;

  return (
    <div className={className?.trim() || undefined}>
      <nav aria-label={navAriaLabel}>
        <div className="-mx-1 overflow-x-auto pb-1 pt-3 [scrollbar-width:thin]">
          <ol className="m-0 flex w-full min-w-[min(100%,44rem)] list-none flex-nowrap gap-0 p-0 sm:min-w-full">
            {steps.map((step, index) => {
              const completed = index !== currentStep && index <= ceiling;
              const active = index === currentStep;
              const upcoming = index > ceiling;

              const label = `Étape ${step.number} — ${step.stepperLine}`;
              const ariaLabel = completed
                ? `${label}, terminée`
                : active
                  ? `${label}, étape en cours`
                  : `${label}, non disponible`;

              const circleClass = completed
                ? "box-border flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-success text-white transition-opacity hover:opacity-95"
                : active
                  ? "box-border flex h-10 w-10 shrink-0 cursor-default items-center justify-center rounded-full bg-accent text-lg font-bold text-white ring-4 ring-accent/20 ring-offset-2 ring-offset-panel"
                  : "box-border flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full border-2 border-border bg-surface font-medium text-muted";

              const iconClass = completed
                ? "material-symbols-outlined text-success"
                : active
                  ? "material-symbols-outlined text-accent"
                  : "material-symbols-outlined text-muted";

              const leftLineDone = index > 0 && index - 1 <= ceiling && index <= ceiling;
              const rightLineDone = index < lastIndex && index <= ceiling && index + 1 <= ceiling;

              return (
                <li key={step.id} className="flex min-w-0 flex-1 flex-col items-stretch">
                  <div className="flex w-full min-w-0 items-center">
                    <div
                      className={cn(
                        "h-0.5 min-w-2 flex-1",
                        index === 0 ? "bg-transparent" : leftLineDone ? "bg-success" : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      disabled={upcoming}
                      onClick={() => {
                        if (completed) onCompletedStepClick(index);
                      }}
                      className={cn(circleClass, "relative z-10")}
                      aria-current={active ? "step" : undefined}
                      aria-label={ariaLabel}
                    >
                      {completed ? (
                        <span
                          className="material-symbols-outlined text-sm leading-none text-white"
                          aria-hidden="true"
                        >
                          check
                        </span>
                      ) : (
                        step.number
                      )}
                    </button>
                    <div
                      className={cn(
                        "h-0.5 min-w-2 flex-1",
                        index === lastIndex
                          ? "bg-transparent"
                          : rightLineDone
                            ? "bg-success"
                            : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className="mx-auto mt-2 flex max-w-28 flex-wrap justify-center gap-1 px-0.5"
                    aria-hidden="true"
                  >
                    {step.icons.map((icon) => (
                      <span
                        key={icon}
                        className={iconClass}
                        style={{ fontSize: 18 }}
                        title={materialIconTooltip(icon)}
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </div>
  );
}
