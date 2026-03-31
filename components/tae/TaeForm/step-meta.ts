import { TAE_BLUEPRINT_STEP_DESCRIPTION } from "@/lib/ui/ui-copy";
import { BLOC1_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc1-stepper-icons";
import { BLOC2_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc2-stepper-icons";
import { BLOC3_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc3-stepper-icons";
import { BLOC4_STEPPER_ICONS } from "@/components/tae/TaeForm/bloc4-stepper-icons";
import {
  BLOC5_STEPPER_ICONS,
  BLOC6_STEPPER_ICONS,
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
    stepperLine: "Consigne et production attendue",
    label: "Étape 3 · Consigne et production attendue",
    description:
      "Param\u00e9trez la consigne destin\u00e9e \u00e0 l\u2019\u00e9l\u00e8ve, les \u00e9l\u00e9ments utiles \u00e0 l\u2019\u00e9valuation comme la r\u00e9ponse attendue, les aspects de soci\u00e9t\u00e9 associ\u00e9s \u00e0 la t\u00e2che pour son indexation, ainsi que le guidage compl\u00e9mentaire.",
    icons: BLOC3_STEPPER_ICONS,
  },
  {
    id: "documents",
    number: 4,
    stepperLine: "Documents historiques",
    label: "Étape 4 · Documents historiques",
    description: "Associez les documents historiques pertinents.",
    icons: BLOC4_STEPPER_ICONS,
  },
  {
    id: "cd",
    number: 5,
    stepperLine: "Compétence disciplinaire",
    label: "Étape 5 · Compétence disciplinaire",
    description:
      "Sélectionnez la compétence, la composante et le critère dans le référentiel ministériel.",
    icons: BLOC5_STEPPER_ICONS,
  },
  {
    id: "connaissances",
    number: 6,
    stepperLine: "Connaissances relatives",
    label: "Étape 6 · Connaissances relatives",
    description:
      "Sélectionnez une ou plusieurs connaissances relatives au programme en parcourant les colonnes (réalité sociale ou période, sections, énoncés).",
    icons: BLOC6_STEPPER_ICONS,
  },
] as const;

export type TaeFormStepId = (typeof TAE_FORM_STEPS)[number]["id"];
