import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

/**
 * Glyphes des sous-sections du bloc 2 — alignés sur les en-têtes dans `Bloc2EditFields`,
 * `OiPicker`, `ComportementPicker`, `Bloc2EspaceProductionReadonly`.
 */
export const BLOC2_STEPPER_ICON = {
  niveau: ICONES_METIER.niveau,
  discipline: ICONES_METIER.discipline,
  oi: ICONES_METIER.operationIntellectuelle,
  comportement: ICONES_METIER.comportement,
  nbLignes: ICONES_METIER.nombreLignes,
} as const;
