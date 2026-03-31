"use client";

import type { RefObject } from "react";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";

type Props = {
  slot: DocumentSlotData;
  letter: string;
  fileRef: RefObject<HTMLInputElement | null>;
  imageUploading: boolean;
  onFile: (file: File | null) => void | Promise<void>;
};

export function DocumentSlotImageField({ slot, letter, fileRef, imageUploading, onFile }: Props) {
  return (
    <ImageUploadDropzone
      fileRef={fileRef}
      imageUploading={imageUploading}
      onFile={onFile}
      imageUrl={slot.imageUrl}
      imageAlt={slot.titre || `Document ${letter}`}
      uploadMeta={slot.imageUploadMeta}
      imageUnoptimized={Boolean(slot.imageUrl?.startsWith("blob:"))}
    />
  );
}
