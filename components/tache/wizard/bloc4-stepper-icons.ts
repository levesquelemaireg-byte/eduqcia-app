import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

/**
 * Glyphes sous la pastille étape 4 — types textuel / iconographique (BLOC4-DOCUMENTS.md §9.1).
 * Aligné sur le bloc ; le stepper importe ce module via `step-meta.ts`.
 *
 * `image` reste local (variante « iconographique » du concept Documents, hors mapping métier).
 */
export const BLOC4_STEPPER_ICONS = [ICONES_METIER.documents, "image"] as const;
