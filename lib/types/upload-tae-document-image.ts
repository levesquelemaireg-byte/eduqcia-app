export type UploadTaeDocumentImageValidationReason =
  | "oversized"
  | "format"
  | "file_too_large"
  | "unreadable";

export type UploadTaeDocumentImageResult =
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
      validationReason?: UploadTaeDocumentImageValidationReason;
    };
