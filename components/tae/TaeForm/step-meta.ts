import { TAE_FORM_STEP_COUNT } from "@/lib/tae/tae-form-state-types";
import {
  BLOC3_DESCRIPTION,
  BLOC3_TITRE,
  BLOC4_DESCRIPTION,
  BLOC4_TITRE,
  BLOC5_DESCRIPTION,
  BLOC5_TITRE,
  BLOC6_CD_DESCRIPTION,
  BLOC6_CD_TITRE,
  BLOC7_DESCRIPTION,
  BLOC7_TITRE,
  TAE_BLUEPRINT_STEP_DESCRIPTION,
} from "@/lib/ui/ui-copy";
import { BLOC1_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc1-stepper-icons";
import { BLOC2_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc2-stepper-icons";
import { BLOC3_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { BLOC4_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc4-stepper-icons";
import {
  BLOC5_TAE_STEPPER_ICONS,
  BLOC6_CD_TAE_STEPPER_ICONS,
  BLOC7_TAE_STEPPER_ICONS,
} from "@/components/tae/TaeForm/tae-future-step-icons";

/**
 * Étapes du formulaire « Créer une tâche » — libellés & navigation avec `FormState` et le stepper.
 * Les glyphes sous chaque pastille viennent des modules `blocN-stepper-icons` (vérité = blocs du formulaire),
 * pas d’une liste parallèle ici. Voir `docs/WORKFLOWS.md` (TAE stepper).
 * Libellés longs : `docs/UI-COPY.md` ; pas d’icône devant le titre d’étape dans le corps (`docs/DECISIONS.md` — conventions wizard).
 */
export const TAE_FORM_STEPS = [
  {
    id: "conception",
    number: 1,
    stepperLine: "Auteur(s) de la tâche",
    label: "Étape 1 — Auteur(s) de la tâche",
    description:
      "Indiquez si vous avez conçu cette tâche seul ou avec des collègues. Si elle a été réalisée en équipe, ajoutez leurs noms ci-dessous pour les inclure comme collaborateurs.",
    icons: BLOC1_STEPPER_ICONS,
  },
  {
    id: "blueprint",
    number: 2,
    stepperLine: "Paramètres de la tâche",
    label: "Étape 2 — Paramètres de la tâche",
    description: TAE_BLUEPRINT_STEP_DESCRIPTION,
    icons: BLOC2_STEPPER_ICONS,
  },
  {
    id: "redaction",
    number: 3,
    stepperLine: BLOC3_TITRE,
    label: `Étape 3 · ${BLOC3_TITRE}`,
    description: BLOC3_DESCRIPTION,
    icons: BLOC3_STEPPER_ICONS,
  },
  {
    id: "documents",
    number: 4,
    stepperLine: BLOC4_TITRE,
    label: `Étape 4 · ${BLOC4_TITRE}`,
    description: BLOC4_DESCRIPTION,
    icons: BLOC4_STEPPER_ICONS,
  },
  {
    id: "corrige-options",
    number: 5,
    stepperLine: BLOC5_TITRE,
    label: `Étape 5 · ${BLOC5_TITRE}`,
    description: BLOC5_DESCRIPTION,
    icons: BLOC5_TAE_STEPPER_ICONS,
  },
  {
    id: "cd",
    number: 6,
    stepperLine: BLOC6_CD_TITRE,
    label: `Étape 6 · ${BLOC6_CD_TITRE}`,
    description: BLOC6_CD_DESCRIPTION,
    icons: BLOC6_CD_TAE_STEPPER_ICONS,
  },
  {
    id: "indexation",
    number: 7,
    stepperLine: BLOC7_TITRE,
    label: `Étape 7 · ${BLOC7_TITRE}`,
    description: BLOC7_DESCRIPTION,
    icons: BLOC7_TAE_STEPPER_ICONS,
  },
] as const;

if (TAE_FORM_STEPS.length !== TAE_FORM_STEP_COUNT) {
  throw new Error(
    `TAE_FORM_STEPS.length (${TAE_FORM_STEPS.length}) doit égaler TAE_FORM_STEP_COUNT (${TAE_FORM_STEP_COUNT}).`,
  );
}

export type TaeFormStepId = (typeof TAE_FORM_STEPS)[number]["id"];
