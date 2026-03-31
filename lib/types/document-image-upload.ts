/** Métadonnées affichées après téléversement (serveur `resizeImage`). */
export type DocumentImageUploadMeta = {
  width: number;
  height: number;
  wasResized: boolean;
  fileSizeBytes: number;
};
