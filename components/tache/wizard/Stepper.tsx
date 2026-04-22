"use client";

import { TACHE_FORM_STEPS } from "@/components/tache/wizard/step-meta";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { WizardStepper, type WizardStepDefinition } from "@/components/wizard/WizardStepper";

type StepperProps = {
  /** Padding : le stepper est l’en-tête **dans** la carte du formulaire (`docs/WORKFLOWS.md` — TAE stepper). */
  className?: string;
};

const TACHE_STEPS_FOR_STEPPER: readonly WizardStepDefinition[] = TACHE_FORM_STEPS.map((s) => ({
  id: s.id,
  number: s.number,
  stepperLine: s.stepperLine,
  icons: s.icons,
}));

/**
 * Barre d’étapes du wizard TAÉ — délègue à `WizardStepper` (même rendu que les autres wizards).
 */
export function Stepper({ className }: StepperProps) {
  const { state, dispatch } = useTacheForm();
  return (
    <WizardStepper
      className={className}
      steps={TACHE_STEPS_FOR_STEPPER}
      currentStep={state.currentStep}
      highestReachedStep={state.highestReachedStep}
      onCompletedStepClick={(index) => dispatch({ type: "SET_STEP", step: index })}
      navAriaLabel="Étapes du formulaire de création de tâche"
    />
  );
}
