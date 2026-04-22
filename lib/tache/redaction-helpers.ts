/** docs/WORKFLOWS.md §4.3 — cases du formulaire (pas « Scientifique et technologique »). */
export type AspectSocieteKey = "economique" | "politique" | "social" | "culturel" | "territorial";

export type RedactionSlice = {
  consigne: string;
  aspects: Record<AspectSocieteKey, boolean>;
  guidage: string;
  corrige: string;
};

export const initialAspects: Record<AspectSocieteKey, boolean> = {
  economique: false,
  politique: false,
  social: false,
  culturel: false,
  territorial: false,
};

export const initialRedactionSlice: RedactionSlice = {
  consigne: "",
  aspects: { ...initialAspects },
  guidage: "",
  corrige: "",
};

import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";

/**
 * Parcours rédactionnel — prérequis **étape 4 (documents)** : consigne (étape 3) uniquement.
 * Aspects (étape 7) et corrigé (étape 5) ne sont pas exigés avant le dossier documentaire.
 */
export function isRedactionSliceConsigneReady(r: RedactionSlice): boolean {
  return htmlHasMeaningfulText(r.consigne);
}

/**
 * Parcours rédactionnel — prérequis **étape 6 (compétence disciplinaire)** : consigne + corrigé.
 * Les aspects de société sont traités à l’étape 7 (indexation).
 */
export function isRedactionSliceReadyForCdGate(r: RedactionSlice): boolean {
  if (!htmlHasMeaningfulText(r.consigne)) return false;
  if (!htmlHasMeaningfulText(r.corrige)) return false;
  return true;
}

/**
 * Validation **publication** : consigne + au moins un aspect + corrigé (référentiel complet).
 * Aligné wizard 7 étapes : étapes 3, 5 et 7 pour la partie « rédaction / indexation ».
 */
export function isRedactionStepComplete(r: RedactionSlice): boolean {
  if (!htmlHasMeaningfulText(r.consigne)) return false;
  if (!Object.values(r.aspects).some(Boolean)) return false;
  if (!htmlHasMeaningfulText(r.corrige)) return false;
  return true;
}
