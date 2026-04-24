import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

/**
 * Stepper TAÉ — étape 5 (Corrigé et options) : corrigé / production attendue + options de réponse (non rédactionnel).
 * `docs/DESIGN-SYSTEM.md` — Corrigé (`task_alt`) ; options — `list_alt_check` (justification : `docs/DECISIONS.md`, `icon-justifications.ts`).
 */
export const BLOC5_TACHE_STEPPER_ICONS = [ICONES_METIER.corrige, "list_alt_check"] as const;
export const BLOC6_CD_TACHE_STEPPER_ICONS = [ICONES_METIER.competenceDisciplinaire] as const;
export const BLOC7_TACHE_STEPPER_ICONS = [
  ICONES_METIER.aspectsSociete,
  ICONES_METIER.connaissances,
] as const;
