import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

/**
 * Glyphes des sections du bloc 3 — ordre : consigne → guidage (corrigé et aspects : autres étapes).
 * Le stepper importe ce module.
 */
export const BLOC3_SECTION_ICON = {
  consigne: ICONES_METIER.consigne,
  aspects: ICONES_METIER.aspectsSociete,
  corrige: ICONES_METIER.corrige,
  guidage: ICONES_METIER.guidage,
} as const;

export const BLOC3_STEPPER_ICONS = [
  BLOC3_SECTION_ICON.consigne,
  BLOC3_SECTION_ICON.guidage,
] as const;
