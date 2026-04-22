/**
 * Glyphes des sous-sections du bloc 2 — alignés sur les en-têtes dans `Bloc2EditFields`,
 * `OiPicker`, `ComportementPicker`, `Bloc2EspaceProductionReadonly`. Le stepper importe ce module.
 */
export const BLOC2_STEPPER_ICON = {
  niveau: "school",
  discipline: "menu_book",
  oi: "psychology",
  comportement: "table",
  nbLignes: "format_line_spacing",
} as const;

export const BLOC2_STEPPER_ICONS = [
  BLOC2_STEPPER_ICON.niveau,
  BLOC2_STEPPER_ICON.discipline,
  BLOC2_STEPPER_ICON.oi,
  BLOC2_STEPPER_ICON.comportement,
  BLOC2_STEPPER_ICON.nbLignes,
] as const;
