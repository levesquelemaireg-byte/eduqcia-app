import "server-only";

import sharp from "sharp";

import { UPLOAD_IMAGE_MAX_HEIGHT, UPLOAD_IMAGE_MAX_WIDTH } from "@/lib/images/upload-image-max-box";

/** Plafond après redimensionnement / compression — aligné spec lot upload. */
export const RESIZE_IMAGE_MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

export type ResizeImageContentType = "image/jpeg" | "image/png" | "image/webp";

export type ResizeImageResult = {
  buffer: Buffer;
  width: number;
  height: number;
  wasResized: boolean;
  fileSizeBytes: number;
  contentType: ResizeImageContentType;
};

export class ResizeImageError extends Error {
  constructor(
    public readonly code:
      | "FORMAT_NOT_ACCEPTED"
      | "FILE_TOO_LARGE_AFTER_RESIZE"
      | "IMAGE_UNREADABLE",
  ) {
    super(code);
    this.name = "ResizeImageError";
  }
}

function normalizeInputMime(mimeType: string): ResizeImageContentType | null {
  const m = mimeType.trim().toLowerCase();
  if (m === "image/jpg" || m === "image/jpeg") return "image/jpeg";
  if (m === "image/png") return "image/png";
  if (m === "image/webp") return "image/webp";
  return null;
}

async function encodeResized(
  pipeline: sharp.Sharp,
  contentType: ResizeImageContentType,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  if (contentType === "image/png") {
    const out = await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
    const w = out.info.width;
    const h = out.info.height;
    if (w == null || h == null || w < 1 || h < 1) {
      throw new ResizeImageError("IMAGE_UNREADABLE");
    }
    return { buffer: out.data, width: w, height: h };
  }
  if (contentType === "image/webp") {
    const out = await pipeline.webp({ quality: 92 }).toBuffer({ resolveWithObject: true });
    const w = out.info.width;
    const h = out.info.height;
    if (w == null || h == null || w < 1 || h < 1) {
      throw new ResizeImageError("IMAGE_UNREADABLE");
    }
    return { buffer: out.data, width: w, height: h };
  }
  const out = await pipeline
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  const w = out.info.width;
  const h = out.info.height;
  if (w == null || h == null || w < 1 || h < 1) {
    throw new ResizeImageError("IMAGE_UNREADABLE");
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
    if (next.byteLength <= RESIZE_IMAGE_MAX_OUTPUT_BYTES) {
      return next;
    }
  }
  throw new ResizeImageError("FILE_TOO_LARGE_AFTER_RESIZE");
}

/**
 * Redimensionnement dans la boîte max, sans upscale ni déformation (fit `inside`), compression ciblée si > 2 Mo.
 */
export async function resizeImage(
  inputBuffer: Buffer,
  mimeType: string,
): Promise<ResizeImageResult> {
  const normalizedMime = normalizeInputMime(mimeType);
  if (!normalizedMime) {
    throw new ResizeImageError("FORMAT_NOT_ACCEPTED");
  }

  let meta: sharp.Metadata;
  try {
    meta = await sharp(inputBuffer, { failOn: "error" }).metadata();
  } catch {
    throw new ResizeImageError("IMAGE_UNREADABLE");
  }

  const ow = meta.width;
  const oh = meta.height;
  if (ow == null || oh == null || ow < 1 || oh < 1) {
    throw new ResizeImageError("IMAGE_UNREADABLE");
  }

  const pipeline = sharp(inputBuffer, { failOn: "error" }).resize(
    UPLOAD_IMAGE_MAX_WIDTH,
    UPLOAD_IMAGE_MAX_HEIGHT,
    { fit: "inside", withoutEnlargement: true },
  );

  let { buffer, width, height } = await encodeResized(pipeline, normalizedMime);
  let contentType: ResizeImageContentType = normalizedMime;
  const wasResized = width !== ow || height !== oh;

  if (buffer.byteLength > RESIZE_IMAGE_MAX_OUTPUT_BYTES) {
    buffer = await compressToMaxBytes(buffer);
    contentType = "image/jpeg";
    const m = await sharp(buffer, { failOn: "error" }).metadata();
    const w = m.width;
    const h = m.height;
    if (w == null || h == null || w < 1 || h < 1) {
      throw new ResizeImageError("IMAGE_UNREADABLE");
    }
    width = w;
    height = h;
  }

  return {
    buffer,
    width,
    height,
    wasResized,
    fileSizeBytes: buffer.byteLength,
    contentType,
  };
}
