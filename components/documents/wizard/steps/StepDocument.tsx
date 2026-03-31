"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { DocumentLegendPositionGrid } from "@/components/documents/DocumentLegendPositionGrid";
import { DocumentLegendTextField } from "@/components/documents/DocumentLegendTextField";
import { DocumentSourceRichEditor } from "@/components/documents/DocumentSourceRichEditor";
import { SourceTypeRadiosWithTooltips } from "@/components/documents/SourceTypeRadiosWithTooltips";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { uploadTaeDocumentImageAction } from "@/lib/actions/documents";
import { isDocumentPdfUrl } from "@/lib/documents/is-document-pdf-url";
import { validateClientImageFile } from "@/lib/images/image-upload-constants";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import { countWordsFr } from "@/lib/schemas/autonomous-document";
import { isPublicHttpUrl } from "@/lib/tae/document-helpers";
import type { DocumentImageUploadMeta } from "@/lib/types/document-image-upload";
import { messageForUploadValidationReason } from "@/lib/ui/upload-image-validation-toast";
import {
  DOCUMENT_MODULE_CONTENU_LABEL,
  DOCUMENT_MODULE_SOURCE_FORMAT_HINT,
  DOCUMENT_MODULE_SOURCE_LABEL,
  DOCUMENT_MODULE_SOURCE_PLACEHOLDER,
  DOCUMENT_MODULE_TITRE_LABEL,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_WIZARD_IMAGE_FILE_LABEL,
  DOCUMENT_WIZARD_IMAGE_FORMATS_HINT,
  DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW,
  DOCUMENT_WIZARD_TYPE_DOC_LABEL,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH,
  TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED,
} from "@/lib/ui/ui-copy";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { RepereTemporelField } from "@/components/ui/RepereTemporelField";
import { cn } from "@/lib/utils/cn";

/**
 * Étape unique « Document » — même ordre et composants que le Bloc 4 (création de document dans la TAÉ).
 */
export function StepDocument() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AutonomousDocumentFormValues>();

  const titreId = useId();
  const sourceId = useId();
  const sourceErrorId = "doc-wizard-source-error";
  const sourceHintId = "doc-wizard-source-hint";
  const contenuId = useId();
  const typeDocGroupId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadMeta, setImageUploadMeta] = useState<DocumentImageUploadMeta | null>(null);

  const docType = watch("doc_type");
  const imageLegende = watch("image_legende");
  const imageUrl = watch("image_url");
  const titre = watch("titre");

  const legendWords = countWordsFr(imageLegende ?? "");

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        setValue("image_url", "", { shouldValidate: true });
        setValue("image_intrinsic_width", undefined, { shouldValidate: true });
        setValue("image_intrinsic_height", undefined, { shouldValidate: true });
        setImageUploadMeta(null);
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
      setImageUploading(true);
      const fd = new FormData();
      fd.set("file", file);
      const r = await uploadTaeDocumentImageAction(fd);
      setImageUploading(false);
      if (r.ok === false) {
        if (r.code === "auth") toast.error(TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH);
        else if (r.code === "validation")
          toast.error(messageForUploadValidationReason(r.validationReason));
        else toast.error(TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED);
        return;
      }
      setValue("image_url", r.publicUrl, { shouldValidate: true });
      setValue("image_intrinsic_width", r.width, { shouldValidate: true });
      setValue("image_intrinsic_height", r.height, { shouldValidate: true });
      setImageUploadMeta({
        width: r.width,
        height: r.height,
        wasResized: r.wasResized,
        fileSizeBytes: r.fileSizeBytes,
      });
    },
    [setValue],
  );

  const isPdfLegacy = Boolean(imageUrl && isDocumentPdfUrl(imageUrl));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p id={typeDocGroupId} className="text-sm font-semibold text-deep">
          {DOCUMENT_WIZARD_TYPE_DOC_LABEL} <RequiredMark />
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={typeDocGroupId}>
          <button
            type="button"
            onClick={() => setValue("doc_type", "textuel", { shouldValidate: true })}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ring-1 transition-colors",
              docType === "textuel"
                ? "bg-accent/10 text-accent ring-accent/30"
                : "bg-panel text-muted ring-border/60 hover:ring-accent/35",
            )}
          >
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              docs
            </span>
            {DOCUMENT_MODULE_TYPE_TEXT}
          </button>
          <button
            type="button"
            onClick={() => setValue("doc_type", "iconographique", { shouldValidate: true })}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ring-1 transition-colors",
              docType === "iconographique"
                ? "bg-accent/10 text-accent ring-accent/30"
                : "bg-panel text-muted ring-border/60 hover:ring-accent/35",
            )}
          >
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              image
            </span>
            {DOCUMENT_MODULE_TYPE_IMAGE}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={titreId} className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_TITRE_LABEL} <RequiredMark />
        </label>
        <input
          id={titreId}
          type="text"
          {...register("titre")}
          autoComplete="off"
          aria-invalid={errors.titre ? true : undefined}
          className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep"
        />
        {errors.titre ? (
          <p className="text-sm text-error" role="alert">
            {errors.titre.message}
          </p>
        ) : null}
      </div>

      <RepereTemporelField
        repereTemporelValue={watch("repere_temporel")}
        onRepereTemporelChange={(val) => setValue("repere_temporel", val, { shouldValidate: true })}
        anneeNormaliseeValue={watch("annee_normalisee")}
        onAnneeNormaliseeChange={(val) =>
          setValue("annee_normalisee", val, { shouldValidate: true })
        }
        errorRepere={errors.repere_temporel?.message}
        errorAnnee={errors.annee_normalisee?.message}
      />

      <div className="space-y-2">
        <label htmlFor={sourceId} className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_SOURCE_LABEL} <RequiredMark />
        </label>
        <p id={sourceHintId} className="text-xs text-muted">
          {DOCUMENT_MODULE_SOURCE_PLACEHOLDER} {DOCUMENT_MODULE_SOURCE_FORMAT_HINT}
        </p>
        <Controller
          name="source_citation"
          control={control}
          render={({ field }) => (
            <DocumentSourceRichEditor
              id={sourceId}
              value={field.value}
              onChange={field.onChange}
              aria-invalid={errors.source_citation ? true : undefined}
              aria-describedby={
                [errors.source_citation ? sourceErrorId : null, sourceHintId]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            />
          )}
        />
        {errors.source_citation ? (
          <p id={sourceErrorId} className="text-sm text-error" role="alert">
            {errors.source_citation.message}
          </p>
        ) : null}
      </div>

      <Controller
        name="source_type"
        control={control}
        render={({ field }) => (
          <SourceTypeRadiosWithTooltips
            value={field.value}
            onChange={field.onChange}
            errorMessage={errors.source_type?.message}
          />
        )}
      />

      {docType === "textuel" ? (
        <div className="space-y-2">
          <label htmlFor={contenuId} className="text-sm font-semibold text-deep">
            {DOCUMENT_MODULE_CONTENU_LABEL} <RequiredMark />
          </label>
          <textarea
            id={contenuId}
            {...register("contenu")}
            rows={8}
            aria-invalid={errors.contenu ? true : undefined}
            className="w-full resize-y rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-deep"
          />
          {errors.contenu ? (
            <p className="text-sm text-error" role="alert">
              {errors.contenu.message}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-deep">
              {DOCUMENT_WIZARD_IMAGE_FILE_LABEL} <RequiredMark />
            </p>
            {errors.image_url ? (
              <p className="text-sm text-error" role="alert">
                {errors.image_url.message}
              </p>
            ) : null}
            {isPdfLegacy ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
                  <span
                    className="material-symbols-outlined flex h-16 w-16 shrink-0 items-center justify-center text-4xl text-muted"
                    aria-hidden="true"
                  >
                    picture_as_pdf
                  </span>
                  <div className="min-w-0 flex-1 text-sm text-deep">
                    {DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW}
                  </div>
                  <button
                    type="button"
                    className="text-sm text-accent hover:underline"
                    disabled={imageUploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    Remplacer
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={IMAGE_UPLOAD_ACCEPT_ATTR}
                    disabled={imageUploading}
                    className="sr-only"
                    onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  {DOCUMENT_WIZARD_IMAGE_FORMATS_HINT}
                </p>
              </div>
            ) : (
              <ImageUploadDropzone
                fileRef={fileRef}
                imageUploading={imageUploading}
                onFile={onFile}
                imageUrl={imageUrl?.trim() ? imageUrl : null}
                imageAlt={titre?.trim() || ""}
                uploadMeta={imageUploadMeta}
                imageUnoptimized={Boolean(imageUrl && !isPublicHttpUrl(imageUrl))}
              />
            )}
          </div>

          <div className="space-y-3 border-t border-border/50 pt-4">
            <Controller
              name="image_legende"
              control={control}
              render={({ field }) => (
                <DocumentLegendTextField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  legendWords={legendWords}
                  showWordsError={Boolean(errors.image_legende) || legendWords > 50}
                />
              )}
            />
            {errors.image_legende?.message ? (
              <p className="text-sm text-error" role="alert">
                {errors.image_legende.message}
              </p>
            ) : null}
          </div>

          {(imageLegende ?? "").trim().length > 0 ? (
            <div className="space-y-2 border-t border-border/40 pt-4">
              <Controller
                name="image_legende_position"
                control={control}
                render={({ field }) => (
                  <DocumentLegendPositionGrid
                    value={field.value ?? null}
                    onChange={field.onChange}
                    showPositionError={Boolean(errors.image_legende_position)}
                  />
                )}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
