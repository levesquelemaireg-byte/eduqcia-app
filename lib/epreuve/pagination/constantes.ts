/**
 * Constantes de dimension pour la pagination PDF — Letter portrait 96 dpi.
 *
 * Toutes les valeurs sont en pixels CSS a 96 dpi.
 *
 * L'en-tête d'épreuve et la pagination de bas de page vivent dans les
 * marges 2 cm via positionnement absolu (`SectionPage`). Ils n'occupent
 * donc aucun espace dans la zone de contenu.
 */

/** Hauteur totale d'une page Letter portrait (11" x 96 dpi). */
export const PAGE_HEIGHT_PX = 1056;

/** Largeur d'une page Letter portrait (8.5" x 96 dpi). */
export const PAGE_WIDTH_PX = 816;

/** Espace vertical occupé par les marges haut + bas (2 cm × 2 = 76 px × 2). */
export const PAGE_MARGIN_PX = 152;

/** Marge de garde pour absorber la derive subpixel entre navigateurs. */
export const TOLERANCE_PX = 4;

/**
 * Hauteur maximale disponible pour les blocs de contenu sur une page.
 * = PAGE_HEIGHT_PX - PAGE_MARGIN_PX = 1056 - 152 = 904.
 */
export const MAX_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_MARGIN_PX;

/** Ratio maximum bloc / hauteur disponible avant erreur de debordement. */
export const RATIO_MAX_BLOC = 0.97;
