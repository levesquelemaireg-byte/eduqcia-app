/**
 * Boîte maximale pour les images téléversées (documents TAÉ / wizard autonome).
 * Réduction proportionnelle uniquement si nécessaire — jamais d’agrandissement.
 */

export const UPLOAD_IMAGE_MAX_WIDTH = 660;
export const UPLOAD_IMAGE_MAX_HEIGHT = 400;

/**
 * Dimensions finales (arrondies) pour tenir dans {@link UPLOAD_IMAGE_MAX_WIDTH} × {@link UPLOAD_IMAGE_MAX_HEIGHT}
 * sans déformation ni upscale — aligné sur la règle produit (facteur = min(660/w, 400/h, 1)).
 */
export function computeFinalDimensionsForUploadBox(
  originalWidth: number,
  originalHeight: number,
): { width: number; height: number } {
  if (!Number.isFinite(originalWidth) || !Number.isFinite(originalHeight)) {
    throw new RangeError("Les dimensions doivent être finies.");
  }
  if (originalWidth < 1 || originalHeight < 1) {
    throw new RangeError("Les dimensions doivent être strictement positives.");
  }
  const scale = Math.min(
    UPLOAD_IMAGE_MAX_WIDTH / originalWidth,
    UPLOAD_IMAGE_MAX_HEIGHT / originalHeight,
    1,
  );
  return {
    width: Math.max(1, Math.round(originalWidth * scale)),
    height: Math.max(1, Math.round(originalHeight * scale)),
  };
}
