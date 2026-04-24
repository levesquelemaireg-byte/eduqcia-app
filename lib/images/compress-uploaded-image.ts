import "server-only";

import sharp from "sharp";

/** Plafond après encodage / compression. */
export const COMPRESS_IMAGE_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

export type CompressUploadedImageContentType = "image/jpeg" | "image/png" | "image/webp";

export type CompressUploadedImageResult = {
  buffer: Buffer;
  width: number;
  height: number;
  /** `true` si la compression JPEG dégressive a été déclenchée pour passer sous le plafond. */
  wasCompressed: boolean;
  fileSizeBytes: number;
  contentType: CompressUploadedImageContentType;
};

export class CompressUploadedImageError extends Error {
  constructor(
    public readonly code:
      | "FORMAT_NOT_ACCEPTED"
      | "FILE_TOO_LARGE_AFTER_COMPRESSION"
      | "IMAGE_UNREADABLE",
  ) {
    super(code);
    this.name = "CompressUploadedImageError";
  }
}

function normalizeInputMime(mimeType: string): CompressUploadedImageContentType | null {
  const m = mimeType.trim().toLowerCase();
  if (m === "image/jpg" || m === "image/jpeg") return "image/jpeg";
  if (m === "image/png") return "image/png";
  if (m === "image/webp") return "image/webp";
  return null;
}

async function encodeOriginal(
  pipeline: sharp.Sharp,
  contentType: CompressUploadedImageContentType,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  if (contentType === "image/png") {
    const out = await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
    const w = out.info.width;
    const h = out.info.height;
    if (w == null || h == null || w < 1 || h < 1) {
      throw new CompressUploadedImageError("IMAGE_UNREADABLE");
    }
    return { buffer: out.data, width: w, height: h };
  }
  if (contentType === "image/webp") {
    const out = await pipeline.webp({ quality: 92 }).toBuffer({ resolveWithObject: true });
    const w = out.info.width;
    const h = out.info.height;
    if (w == null || h == null || w < 1 || h < 1) {
      throw new CompressUploadedImageError("IMAGE_UNREADABLE");
    }
    return { buffer: out.data, width: w, height: h };
  }
  const out = await pipeline
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const w = out.info.width;
  const h = out.info.height;
  if (w == null || h == null || w < 1 || h < 1) {
    throw new CompressUploadedImageError("IMAGE_UNREADABLE");
  }
  return { buffer: out.data, width: w, height: h };
}

/**
 * Réduit la taille fichier sous le plafond en JPEG (conversion autorisée uniquement pour ce besoin).
 */
async function compressToMaxBytes(buffer: Buffer): Promise<Buffer> {
  const qualities = [80, 65, 50, 40, 30];
  for (const q of qualities) {
    const next = await sharp(buffer, { failOn: "error" })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer();
    if (next.byteLength <= COMPRESS_IMAGE_MAX_OUTPUT_BYTES) {
      return next;
    }
  }
  throw new CompressUploadedImageError("FILE_TOO_LARGE_AFTER_COMPRESSION");
}

/**
 * Conserve les dimensions originales de l'image. Compression JPEG dégressive
 * uniquement si l'encodage initial dépasse 2 Mo (pour respecter le plafond
 * stockage). Les dimensions retournées sont les dimensions natives lues par
 * Sharp, pour que le rendu CSS (`max-width` / `max-height`) fasse le travail
 * de mise à l'échelle visuelle.
 */
export async function compressUploadedImage(
  inputBuffer: Buffer,
  mimeType: string,
): Promise<CompressUploadedImageResult> {
  const normalizedMime = normalizeInputMime(mimeType);
  if (!normalizedMime) {
    throw new CompressUploadedImageError("FORMAT_NOT_ACCEPTED");
  }

  let meta: sharp.Metadata;
  try {
    meta = await sharp(inputBuffer, { failOn: "error" }).metadata();
  } catch {
    throw new CompressUploadedImageError("IMAGE_UNREADABLE");
  }

  const ow = meta.width;
  const oh = meta.height;
  if (ow == null || oh == null || ow < 1 || oh < 1) {
    throw new CompressUploadedImageError("IMAGE_UNREADABLE");
  }

  const pipeline = sharp(inputBuffer, { failOn: "error" });

  let { buffer, width, height } = await encodeOriginal(pipeline, normalizedMime);
  let contentType: CompressUploadedImageContentType = normalizedMime;
  let wasCompressed = false;

  if (buffer.byteLength > COMPRESS_IMAGE_MAX_OUTPUT_BYTES) {
    buffer = await compressToMaxBytes(buffer);
    contentType = "image/jpeg";
    wasCompressed = true;
    const m = await sharp(buffer, { failOn: "error" }).metadata();
    const w = m.width;
    const h = m.height;
    if (w == null || h == null || w < 1 || h < 1) {
      throw new CompressUploadedImageError("IMAGE_UNREADABLE");
    }
    width = w;
    height = h;
  }

  return {
    buffer,
    width,
    height,
    wasCompressed,
    fileSizeBytes: buffer.byteLength,
    contentType,
  };
}
