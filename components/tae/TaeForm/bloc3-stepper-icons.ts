/**
 * Glyphes des sections du bloc 3 — docs/WORKFLOWS.md (ordre : consigne → aspects → corrigé → guidage).
 * Le stepper importe ce module.
 */
export const BLOC3_SECTION_ICON = {
  consigne: "quiz",
  aspects: "deployed_code",
  corrige: "task_alt",
  guidage: "tooltip_2",
} as const;

export const BLOC3_STEPPER_ICONS = [
  BLOC3_SECTION_ICON.consigne,
  BLOC3_SECTION_ICON.aspects,
  BLOC3_SECTION_ICON.corrige,
  BLOC3_SECTION_ICON.guidage,
] as const;
