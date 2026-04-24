import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

/**
 * Glyphes Material Symbols pour l'étape 1 — même ordre que les cartes « Seul » / « En équipe »
 * dans `Bloc1AuteursTache`. Le stepper lit ce module ; ne pas dupliquer la liste dans `step-meta`.
 *
 * `groups` reste local (variante « En équipe » du concept auteur, pas dans le mapping métier).
 */
export const BLOC1_STEPPER_ICONS = [ICONES_METIER.auteur, "groups"] as const;
