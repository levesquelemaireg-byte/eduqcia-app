"use server";

import "server-only";

import { randomUUID } from "node:crypto";

import {
  CLIENT_IMAGE_ALLOWED_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/images/image-upload-constants";
import { ResizeImageError, resizeImage } from "@/lib/images/resize-image";
import type {
  UploadTaeDocumentImageResult,
  UploadTaeDocumentImageValidationReason,
} from "@/lib/types/upload-tae-document-image";
import { createClient } from "@/lib/supabase/server";

export type {
  UploadTaeDocumentImageResult,
  UploadTaeDocumentImageValidationReason,
} from "@/lib/types/upload-tae-document-image";

/** Bucket public — Bloc 4 TAÉ et wizard document autonome. */
const BUCKET = "tae-document-images";

/**
 * Envoie une image de document TAÉ vers Supabase Storage (bucket public `tae-document-images`).
 * Chemin : `{user_id}/{uuid}.(jpg|png|webp)` — voir `supabase/schema.sql` § Storage.
 */
export async function uploadTaeDocumentImageAction(
  formData: FormData,
): Promise<UploadTaeDocumentImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "auth" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, code: "validation" };
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return { ok: false, code: "validation", validationReason: "oversized" };
  }
  if (!CLIENT_IMAGE_ALLOWED_TYPES.has(file.type)) {
    return { ok: false, code: "validation", validationReason: "format" };
  }

  const raw = Buffer.from(await file.arrayBuffer());

  let processed: Awaited<ReturnType<typeof resizeImage>>;
  try {
    processed = await resizeImage(raw, file.type);
  } catch (e) {
    if (e instanceof ResizeImageError) {
      if (e.code === "FORMAT_NOT_ACCEPTED") {
        return { ok: false, code: "validation", validationReason: "format" };
      }
      if (e.code === "FILE_TOO_LARGE_AFTER_RESIZE") {
        return { ok: false, code: "validation", validationReason: "file_too_large" };
      }
      return { ok: false, code: "validation", validationReason: "unreadable" };
    }
    return { ok: false, code: "validation", validationReason: "unreadable" };
  }

  const ext =
    processed.contentType === "image/png"
      ? "png"
      : processed.contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${user.id}/${randomUUID()}.${ext}`;
  const body = processed.buffer;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: processed.contentType,
    upsert: false,
  });

  if (error) {
    console.error("uploadTaeDocumentImageAction:", error.message);
    return { ok: false, code: "storage" };
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return {
    ok: true,
    publicUrl: pub.publicUrl,
    width: processed.width,
    height: processed.height,
    wasResized: processed.wasResized,
    fileSizeBytes: processed.fileSizeBytes,
  };
}
