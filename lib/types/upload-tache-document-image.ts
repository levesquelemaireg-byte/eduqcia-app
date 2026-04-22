export type UploadTacheDocumentImageValidationReason =
  | "oversized"
  | "format"
  | "file_too_large"
  | "unreadable";

export type UploadTacheDocumentImageResult =
  | {
      ok: true;
      publicUrl: string;
      width: number;
      height: number;
      wasResized: boolean;
      fileSizeBytes: number;
    }
  | {
      ok: false;
      code: "auth" | "validation" | "storage";
      validationReason?: UploadTacheDocumentImageValidationReason;
    };
