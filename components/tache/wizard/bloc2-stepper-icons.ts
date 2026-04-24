import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

/**
 * Glyphes des sous-sections du bloc 2 — alignés sur les en-têtes dans `Bloc2EditFields`,
 * `OiPicker`, `ComportementPicker`, `Bloc2EspaceProductionReadonly`. Le stepper importe ce module.
 */
export const BLOC2_STEPPER_ICON = {
  niveau: ICONES_METIER.niveau,
  discipline: ICONES_METIER.discipline,
  oi: ICONES_METIER.operationIntellectuelle,
  comportement: ICONES_METIER.comportement,
  nbLignes: ICONES_METIER.nombreLignes,
} as const;

export const BLOC2_STEPPER_ICONS = [
  BLOC2_STEPPER_ICON.niveau,
  BLOC2_STEPPER_ICON.discipline,
  BLOC2_STEPPER_ICON.oi,
  BLOC2_STEPPER_ICON.comportement,
  BLOC2_STEPPER_ICON.nbLignes,
] as const;
