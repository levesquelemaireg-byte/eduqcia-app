import type { UploadTacheDocumentImageValidationReason } from "@/lib/types/upload-tache-document-image";
import {
  IMAGE_UPLOAD_ERROR_FILE_TOO_LARGE_AFTER_RESIZE,
  IMAGE_UPLOAD_ERROR_FORMAT_NOT_ACCEPTED,
  IMAGE_UPLOAD_ERROR_UNREADABLE,
  TOAST_DOCUMENT_IMAGE_INVALID,
  TOAST_DOCUMENT_IMAGE_TOO_LARGE_CLIENT,
} from "@/lib/ui/ui-copy";

export function messageForUploadValidationReason(
  reason: UploadTacheDocumentImageValidationReason | undefined,
): string {
  switch (reason) {
    case "oversized":
      return TOAST_DOCUMENT_IMAGE_TOO_LARGE_CLIENT;
    case "format":
      return IMAGE_UPLOAD_ERROR_FORMAT_NOT_ACCEPTED;
    case "file_too_large":
      return IMAGE_UPLOAD_ERROR_FILE_TOO_LARGE_AFTER_RESIZE;
    case "unreadable":
      return IMAGE_UPLOAD_ERROR_UNREADABLE;
    default:
      return TOAST_DOCUMENT_IMAGE_INVALID;
  }
}
