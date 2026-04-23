"use client";

import type { RefObject } from "react";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";

type Props = {
  slot: DocumentSlotData;
  numero: number;
  fileRef: RefObject<HTMLInputElement | null>;
  imageUploading: boolean;
  onFile: (file: File | null) => void | Promise<void>;
};

export function DocumentSlotImageField({ slot, numero, fileRef, imageUploading, onFile }: Props) {
  return (
    <ImageUploadDropzone
      fileRef={fileRef}
      imageUploading={imageUploading}
      onFile={onFile}
      imageUrl={slot.imageUrl}
      imageAlt={slot.titre || `Document ${numero}`}
      uploadMeta={slot.imageUploadMeta}
      imageUnoptimized={Boolean(slot.imageUrl?.startsWith("blob:"))}
    />
  );
}
