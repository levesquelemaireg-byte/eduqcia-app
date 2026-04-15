/**
 * Constantes de dimension pour la pagination PDF — Letter portrait 96 dpi.
 * Source de verite : print-engine v2.1 section 4.3 (D2) + D6.
 *
 * Toutes les valeurs sont en pixels CSS a 96 dpi.
 */

/** Hauteur totale d'une page Letter portrait (11" x 96 dpi). */
export const PAGE_HEIGHT_PX = 1056;

/** Largeur d'une page Letter portrait (8.5" x 96 dpi). */
export const PAGE_WIDTH_PX = 816;

/** Espace vertical occupe par les marges haut + bas (~2 cm x 2). */
export const PAGE_MARGIN_PX = 151;

/** Hauteur fixe plafonnee de l'en-tete d'epreuve (D6 — Option A). */
export const HEADER_HEIGHT_PX = 80;

/** Marge de garde pour absorber la derive subpixel entre navigateurs. */
export const TOLERANCE_PX = 4;

/**
 * Hauteur maximale disponible pour les blocs de contenu sur une page.
 * = PAGE_HEIGHT_PX - PAGE_MARGIN_PX - HEADER_HEIGHT_PX
 */
export const MAX_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_MARGIN_PX - HEADER_HEIGHT_PX; // 825

/** Ratio maximum bloc / hauteur disponible avant erreur de debordement. */
export const RATIO_MAX_BLOC = 0.97;
