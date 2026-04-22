import type { StepId } from "@/lib/fiche/types";
import { TACHE_FORM_STEPS } from "@/components/tache/wizard/step-meta";

/**
 * Convertit l'index numérique `currentStep` du wizard en `StepId` typé.
 * Retourne `null` si l'index est hors bornes (safety).
 */
export function getCurrentStepId(stepIndex: number): StepId | null {
  const step = TACHE_FORM_STEPS[stepIndex];
  return step ? (step.id as StepId) : null;
}
