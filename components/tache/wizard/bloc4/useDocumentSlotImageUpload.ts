"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadTaeDocumentImageAction } from "@/lib/actions/documents";
import { validateClientImageFile } from "@/lib/images/image-upload-constants";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { messageForUploadValidationReason } from "@/lib/ui/upload-image-validation-toast";
import {
  TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH,
  TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED,
} from "@/lib/ui/ui-copy";

type PatchFn = (p: Partial<DocumentSlotData>) => void;

/**
 * Prévisualisation blob + téléversement image document (Bloc 4).
 */
export function useDocumentSlotImageUpload(patch: PatchFn) {
  const [imageUploading, setImageUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokeCurrentBlob = useCallback(() => {
    if (blobUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      if (blobUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    },
    [],
  );

  const resetLocalUploadState = useCallback(() => {
    setImageUploading(false);
    revokeCurrentBlob();
  }, [revokeCurrentBlob]);

  const handleFile = useCallback(
    async (file: File | null) => {
      revokeCurrentBlob();
      if (!file) {
        patch({
          imageUrl: null,
          imagePixelWidth: null,
          imagePixelHeight: null,
          imageUploadMeta: null,
        });
        return;
      }
      const clientReject = validateClientImageFile(file);
      if (clientReject) {
        toast.error(
          clientReject === "size"
            ? messageForUploadValidationReason("oversized")
            : messageForUploadValidationReason("format"),
        );
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      blobUrlRef.current = previewUrl;
      patch({
        imageUrl: previewUrl,
        imagePixelWidth: null,
        imagePixelHeight: null,
        imageUploadMeta: null,
      });
      setImageUploading(true);

      try {
        const fd = new FormData();
        fd.set("file", file);
        const result = await uploadTaeDocumentImageAction(fd);
        if (!result.ok) {
          if (blobUrlRef.current === previewUrl) {
            URL.revokeObjectURL(previewUrl);
            blobUrlRef.current = null;
          }
          patch({
            imageUrl: null,
            imagePixelWidth: null,
            imagePixelHeight: null,
            imageUploadMeta: null,
          });
          if (result.code === "auth") toast.error(TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH);
          else if (result.code === "validation")
            toast.error(messageForUploadValidationReason(result.validationReason));
          else toast.error(TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED);
          return;
        }
        if (blobUrlRef.current === previewUrl) {
          URL.revokeObjectURL(previewUrl);
          blobUrlRef.current = null;
        }
        patch({
          imageUrl: result.publicUrl,
          imagePixelWidth: result.width,
          imagePixelHeight: result.height,
          imageUploadMeta: {
            width: result.width,
            height: result.height,
            wasResized: result.wasResized,
            fileSizeBytes: result.fileSizeBytes,
          },
        });
      } finally {
        setImageUploading(false);
      }
    },
    [patch, revokeCurrentBlob],
  );

  return { fileRef, imageUploading, handleFile, resetLocalUploadState };
}
