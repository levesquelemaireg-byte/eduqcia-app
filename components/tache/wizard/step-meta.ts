import { TACHE_FORM_STEP_COUNT } from "@/lib/tache/tache-form-state-types";
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
  TACHE_BLUEPRINT_STEP_DESCRIPTION,
} from "@/lib/ui/ui-copy";

/**
 * Étapes du formulaire « Créer une tâche » — libellés & navigation avec `FormState` et le stepper.
 * Voir `docs/WORKFLOWS.md` (stepper tâche).
 * Libellés longs : `docs/UI-COPY.md` ; pas d’icône devant le titre d’étape dans le corps (`docs/DECISIONS.md` — conventions wizard).
 */
export const TACHE_FORM_STEPS = [
  {
    id: "auteurs",
    number: 1,
    stepperLine: "Auteur(s) de la tâche",
    label: "Étape 1 — Auteur(s) de la tâche",
    description:
      "Indiquez si vous avez conçu cette tâche seul ou avec des collègues. Si elle a été réalisée en équipe, ajoutez leurs noms ci-dessous pour les inclure comme collaborateurs.",
  },
  {
    id: "parametres",
    number: 2,
    stepperLine: "Paramètres de la tâche",
    label: "Étape 2 — Paramètres de la tâche",
    description: TACHE_BLUEPRINT_STEP_DESCRIPTION,
  },
  {
    id: "consigne",
    number: 3,
    stepperLine: BLOC3_TITRE,
    label: `Étape 3 · ${BLOC3_TITRE}`,
    description: BLOC3_DESCRIPTION,
  },
  {
    id: "documents",
    number: 4,
    stepperLine: BLOC4_TITRE,
    label: `Étape 4 · ${BLOC4_TITRE}`,
    description: BLOC4_DESCRIPTION,
  },
  {
    id: "corrige",
    number: 5,
    stepperLine: BLOC5_TITRE,
    label: `Étape 5 · ${BLOC5_TITRE}`,
    description: BLOC5_DESCRIPTION,
  },
  {
    id: "cd",
    number: 6,
    stepperLine: BLOC6_CD_TITRE,
    label: `Étape 6 · ${BLOC6_CD_TITRE}`,
    description: BLOC6_CD_DESCRIPTION,
  },
  {
    id: "connaissances",
    number: 7,
    stepperLine: BLOC7_TITRE,
    label: `Étape 7 · ${BLOC7_TITRE}`,
    description: BLOC7_DESCRIPTION,
  },
] as const;

if (TACHE_FORM_STEPS.length !== TACHE_FORM_STEP_COUNT) {
  throw new Error(
    `TACHE_FORM_STEPS.length (${TACHE_FORM_STEPS.length}) doit égaler TACHE_FORM_STEP_COUNT (${TACHE_FORM_STEP_COUNT}).`,
  );
}
