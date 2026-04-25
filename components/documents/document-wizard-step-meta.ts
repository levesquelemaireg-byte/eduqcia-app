import type { WizardStepDefinition } from "@/components/wizard/WizardStepper";
import {
  DOCUMENT_WIZARD_STEP_CLASSIFICATION_DESC,
  DOCUMENT_WIZARD_STEP_CLASSIFICATION_LABEL,
  DOCUMENT_WIZARD_STEP_CONFIRMATION_DESC,
  DOCUMENT_WIZARD_STEP_CONFIRMATION_LABEL,
  DOCUMENT_WIZARD_STEP_DOCUMENT_DESC,
  DOCUMENT_WIZARD_STEP_DOCUMENT_LABEL,
  DOCUMENT_WIZARD_STEP_STRUCTURE_DESC,
  DOCUMENT_WIZARD_STEP_STRUCTURE_LABEL,
} from "@/lib/ui/ui-copy";

export const DOCUMENT_WIZARD_STEP_METAS = [
  {
    id: "structure",
    number: 1,
    stepperLine: "Structure",
    label: DOCUMENT_WIZARD_STEP_STRUCTURE_LABEL,
    description: DOCUMENT_WIZARD_STEP_STRUCTURE_DESC,
  },
  {
    id: "document",
    number: 2,
    stepperLine: "Document",
    label: DOCUMENT_WIZARD_STEP_DOCUMENT_LABEL,
    description: DOCUMENT_WIZARD_STEP_DOCUMENT_DESC,
  },
  {
    id: "classification",
    number: 3,
    stepperLine: "Classification",
    label: DOCUMENT_WIZARD_STEP_CLASSIFICATION_LABEL,
    description: DOCUMENT_WIZARD_STEP_CLASSIFICATION_DESC,
  },
  {
    id: "confirmation",
    number: 4,
    stepperLine: "Confirmation",
    label: DOCUMENT_WIZARD_STEP_CONFIRMATION_LABEL,
    description: DOCUMENT_WIZARD_STEP_CONFIRMATION_DESC,
  },
] as const;

export type DocumentWizardStepIndex = 0 | 1 | 2 | 3;

export const DOCUMENT_WIZARD_STEP_COUNT = DOCUMENT_WIZARD_STEP_METAS.length;

export const DOCUMENT_WIZARD_STEPS_FOR_STEPPER: WizardStepDefinition[] =
  DOCUMENT_WIZARD_STEP_METAS.map((s) => ({
    id: s.id,
    number: s.number,
    stepperLine: s.stepperLine,
  }));
