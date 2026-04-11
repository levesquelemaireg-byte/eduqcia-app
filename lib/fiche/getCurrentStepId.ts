import type { StepId } from "@/lib/fiche/types";
import { TAE_FORM_STEPS } from "@/components/tae/TaeForm/step-meta";

/**
 * Convertit l'index numérique `currentStep` du wizard en `StepId` typé.
 * Retourne `null` si l'index est hors bornes (safety).
 */
export function getCurrentStepId(stepIndex: number): StepId | null {
  const step = TAE_FORM_STEPS[stepIndex];
  return step ? (step.id as StepId) : null;
}
