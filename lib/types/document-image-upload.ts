/** Métadonnées affichées après téléversement (serveur `compressUploadedImage`). */
export type DocumentImageUploadMeta = {
  width: number;
  height: number;
  /** `true` si le fichier a dû être recompressé en JPEG pour passer sous le plafond 2 Mo. */
  wasCompressed: boolean;
  fileSizeBytes: number;
};
