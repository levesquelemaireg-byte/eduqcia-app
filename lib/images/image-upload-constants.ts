/** Plafond avant envoi — aligné action serveur `uploadTaeDocumentImageAction`. */
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const CLIENT_IMAGE_ALLOWED_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateClientImageFile(file: File): "size" | "mime" | null {
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) return "size";
  if (!CLIENT_IMAGE_ALLOWED_TYPES.has(file.type)) return "mime";
  return null;
}
