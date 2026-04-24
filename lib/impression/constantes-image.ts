/**
 * Constantes de rendu image — source unique pour le pipeline impression.
 *
 * L'image téléversée est conservée à sa taille originale (le pipeline upload
 * ne redimensionne plus, voir `lib/images/compress-uploaded-image.ts`). Ces
 * constantes bornent uniquement la taille rendue à l'impression — via le CSS
 * (`.documentFigureImg` `max-width` / `max-height`) et l'heuristique de
 * pagination (`lib/impression/mesure-estimation.ts`).
 */

/** Largeur maximale de l'image rendue dans la fiche imprimable (px à 96 dpi). */
export const PRINT_IMAGE_MAX_WIDTH_PX = 660;

/** Hauteur maximale de l'image rendue dans la fiche imprimable (px à 96 dpi). */
export const PRINT_IMAGE_MAX_HEIGHT_PX = 350;
