/**
 * styles/impression/tokens.ts — constantes de rendu imprimé.
 *
 * Source unique de vérité pour les dimensions et couleurs du pipeline
 * d'impression. À importer plutôt que de hardcoder ces valeurs dans les
 * composants ou les builders.
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §11.2.
 */

/** Hauteur inter-ligne pour les lignes vierges (spec §4.6). */
export const PRINT_LINE_HEIGHT_CM = 0.7;

/** Indentation des listes à puces dans la zone imprimable (spec §4.7). */
export const PRINT_BULLET_INDENT_CM = 1.5;

/** Gap vertical entre rangées d'options NR (spec §4.4). */
export const PRINT_OPTIONS_GAP_PX = 4;

/** Couleur du corrigé (texte rouge + bordures épaissies, spec §4.9). */
export const PRINT_CORRIGE_COLOR = "#c0392b";
