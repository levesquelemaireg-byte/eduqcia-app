"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { DocumentCategorieTextuelleSelect } from "@/components/documents/DocumentCategorieTextuelleSelect";
import { DocumentLegendPositionGrid } from "@/components/documents/DocumentLegendPositionGrid";
import { DocumentLegendTextField } from "@/components/documents/DocumentLegendTextField";
import { DocumentTypeIconographiqueSelect } from "@/components/documents/DocumentTypeIconographiqueSelect";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { uploadTaeDocumentImageAction } from "@/lib/actions/documents";
import { isDocumentPdfUrl } from "@/lib/documents/is-document-pdf-url";
import { validateClientImageFile } from "@/lib/images/image-upload-constants";
import {
  countWordsFr,
  DOCUMENT_LEGEND_MAX_WORDS,
  type AutonomousDocumentFormValues,
} from "@/lib/schemas/autonomous-document";
import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";
import { htmlHasMeaningfulText } from "@/lib/tae/consigne-helpers";
import { isPublicHttpUrl } from "@/lib/tae/document-helpers";
import type { DocumentImageUploadMeta } from "@/lib/types/document-image-upload";
import { messageForUploadValidationReason } from "@/lib/ui/upload-image-validation-toast";
import {
  DOCUMENT_TYPE_ICONO_CATEGORY_LABEL,
  DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL,
  DOCUMENT_MODULE_SOURCE_LABEL,
  DOCUMENT_MODULE_SOURCE_PRIMAIRE,
  DOCUMENT_MODULE_SOURCE_SECONDAIRE,
  DOCUMENT_MODULE_SOURCE_TYPE_LABEL,
  DOCUMENT_MODULE_TITRE_LABEL,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_WIZARD_IMAGE_FILE_LABEL,
  DOCUMENT_WIZARD_PDF_LEGACY_PREVIEW,
  DOCUMENT_WIZARD_STEP1_CONTENU_LABEL,
  DOCUMENT_WIZARD_STEP1_HELP_CONTENU_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_CONTENU_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_FILE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_FILE_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_REPERE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_TITLE,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_CONTENU,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_LEGENDE,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_REPERE,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_TITRE,
  DOCUMENT_WIZARD_STEP1_SOURCE_ARIA_PLACEHOLDER,
  DOCUMENT_WIZARD_TYPE_DOC_LABEL,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH,
  TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED,
  REPERE_TEMPOREL_LABEL,
  REPERE_TEMPOREL_MODAL_TITLE,
} from "@/lib/ui/ui-copy";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { RepereTemporelField } from "@/components/ui/RepereTemporelField";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { getDocumentTypeIcon, getDocumentTypeSource } from "@/lib/tae/document-categories-helpers";
import { cn } from "@/lib/utils/cn";
import stepStyles from "./step-document.module.css";

/**
 * Petite icône Material Symbols Outlined pour les segments — alignement vertical
 * compact avec le texte du label.
 */
function SegmentIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined text-[1.1em]" aria-hidden="true">
      {name}
    </span>
  );
}

type HelpKey = "file" | "legende" | "icono" | "source" | "sourceType" | "repere" | "contenu" | null;

const DOC_TYPE_SEGMENTS = [
  {
    value: "textuel" as const,
    label: DOCUMENT_MODULE_TYPE_TEXT,
    icon: <SegmentIcon name={getDocumentTypeIcon("textuel")} />,
  },
  {
    value: "iconographique" as const,
    label: DOCUMENT_MODULE_TYPE_IMAGE,
    icon: <SegmentIcon name={getDocumentTypeIcon("iconographique")} />,
  },
] as const;

const SOURCE_TYPE_SEGMENTS = [
  {
    value: "primaire" as const,
    label: DOCUMENT_MODULE_SOURCE_PRIMAIRE,
    icon: <SegmentIcon name={getDocumentTypeSource("primaire")?.icon ?? "counter_1"} />,
  },
  {
    value: "secondaire" as const,
    label: DOCUMENT_MODULE_SOURCE_SECONDAIRE,
    icon: <SegmentIcon name={getDocumentTypeSource("secondaire")?.icon ?? "counter_2"} />,
  },
] as const;

/**
 * Étape 1 « Document » — wizard création document (refonte UI compacte, modales d’aide).
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
  const typeDocLabelId = useId();
  const sourceId = useId();
  const sourceErrorId = "doc-wizard-source-error";
  const contenuErrorId = "doc-wizard-contenu-error";
  const contenuEditorId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadMeta, setImageUploadMeta] = useState<DocumentImageUploadMeta | null>(null);
  const [helpKey, setHelpKey] = useState<HelpKey>(null);

  const docType = watch("doc_type");
  const imageLegende = watch("image_legende");
  const imageUrl = watch("image_url");
  const titre = watch("titre");
  const legendTrimmed = (imageLegende ?? "").trim();
  const showLegendPosition = legendTrimmed.length > 0;

  const legendWords = countWordsFr(imageLegende ?? "");

  useEffect(() => {
    if (legendTrimmed.length === 0) {
      setValue("image_legende_position", null, { shouldValidate: true });
    }
  }, [legendTrimmed, setValue]);

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

  const helpTitle =
    helpKey === "file"
      ? DOCUMENT_WIZARD_STEP1_HELP_FILE_TITLE
      : helpKey === "legende"
        ? DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_TITLE
        : helpKey === "icono"
          ? DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_TITLE
          : helpKey === "source"
            ? DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TITLE
            : helpKey === "sourceType"
              ? DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_TITLE
              : helpKey === "repere"
                ? REPERE_TEMPOREL_MODAL_TITLE
                : helpKey === "contenu"
                  ? DOCUMENT_WIZARD_STEP1_HELP_CONTENU_TITLE
                  : "";

  const helpBody =
    helpKey === "file"
      ? DOCUMENT_WIZARD_STEP1_HELP_FILE_BODY
      : helpKey === "legende"
        ? DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_BODY
        : helpKey === "icono"
          ? DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_BODY
          : helpKey === "source"
            ? DOCUMENT_WIZARD_STEP1_HELP_SOURCE_BODY
            : helpKey === "sourceType"
              ? DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_BODY
              : helpKey === "repere"
                ? DOCUMENT_WIZARD_STEP1_HELP_REPERE_BODY
                : helpKey === "contenu"
                  ? DOCUMENT_WIZARD_STEP1_HELP_CONTENU_BODY
                  : "";

  return (
    <div className="space-y-3">
      <SimpleModal
        open={helpKey != null}
        title={helpTitle}
        onClose={() => setHelpKey(null)}
        titleStyle="info-help"
        panelClassName="max-w-lg"
      >
        <p className="text-sm leading-relaxed text-deep">{helpBody}</p>
      </SimpleModal>

      {/* 1. Type de document */}
      <div className="space-y-1.5">
        <p id={typeDocLabelId} className="text-sm font-semibold text-deep">
          {DOCUMENT_WIZARD_TYPE_DOC_LABEL} <RequiredMark />
        </p>
        <SegmentedControl
          aria-labelledby={typeDocLabelId}
          value={docType}
          onChange={(v) => {
            setValue("doc_type", v as "textuel" | "iconographique", { shouldValidate: true });
            if (v === "textuel") {
              setValue("type_iconographique", null, { shouldValidate: true });
            } else {
              setValue("categorie_textuelle", null, { shouldValidate: true });
            }
          }}
          options={[...DOC_TYPE_SEGMENTS]}
        />
      </div>

      {/* 2. Titre */}
      <div className="space-y-1.5">
        <label htmlFor={titreId} className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_TITRE_LABEL} <RequiredMark />
        </label>
        <input
          id={titreId}
          type="text"
          {...register("titre")}
          autoComplete="off"
          placeholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_TITRE}
          aria-invalid={errors.titre ? true : undefined}
          className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
        />
        {errors.titre ? (
          <p className="text-sm text-error" role="alert">
            {errors.titre.message}
          </p>
        ) : null}
      </div>

      <hr className="border-0 border-t border-border/70" />

      {/* 4. Bloc conditionnel type */}
      {docType === "textuel" ? (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-deep">
              {DOCUMENT_WIZARD_STEP1_CONTENU_LABEL} <RequiredMark />
            </span>
            <FieldHelpModalButton onClick={() => setHelpKey("contenu")} />
          </div>
          <Controller
            name="contenu"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                id={contenuEditorId}
                instanceId={contenuEditorId}
                value={field.value ?? ""}
                onChange={(html) => field.onChange(htmlHasMeaningfulText(html) ? html : "")}
                minHeight={120}
                placeholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_CONTENU}
                toolbarAriaLabel="Mise en forme du contenu"
                aria-invalid={errors.contenu ? true : undefined}
                aria-describedby={errors.contenu ? contenuErrorId : undefined}
              />
            )}
          />
          {errors.contenu ? (
            <p id={contenuErrorId} className="text-sm text-error" role="alert">
              {errors.contenu.message}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="doc-wizard-categorie-textuelle"
              className="text-sm font-semibold text-deep"
            >
              {DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL}
            </label>
            <Controller
              name="categorie_textuelle"
              control={control}
              render={({ field }) => (
                <DocumentCategorieTextuelleSelect
                  id="doc-wizard-categorie-textuelle"
                  value={(field.value ?? "") as CategorieTextuelleValue | ""}
                  onChange={(v) => field.onChange(v === "" ? null : v)}
                  showDescription={false}
                  showLabel={false}
                />
              )}
            />
            {errors.categorie_textuelle ? (
              <p className="text-sm text-error" role="alert">
                {errors.categorie_textuelle.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-deep">
                {DOCUMENT_WIZARD_IMAGE_FILE_LABEL} <RequiredMark />
              </span>
              <FieldHelpModalButton onClick={() => setHelpKey("file")} />
            </div>
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
                hideFormatsHint
              />
            )}
          </div>

          <Controller
            name="image_legende"
            control={control}
            render={({ field }) => (
              <DocumentLegendTextField
                value={field.value ?? ""}
                onChange={field.onChange}
                legendWords={legendWords}
                showWordsError={
                  Boolean(errors.image_legende) || legendWords > DOCUMENT_LEGEND_MAX_WORDS
                }
                placeholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_LEGENDE}
                helpModalTitle={DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_TITLE}
                helpModalBody={DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_BODY}
              />
            )}
          />
          {errors.image_legende?.message ? (
            <p className="text-sm text-error" role="alert">
              {errors.image_legende.message}
            </p>
          ) : null}

          {showLegendPosition ? (
            <div className={cn(stepStyles.legendReveal)}>
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

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <label htmlFor="doc-wizard-type-icono" className="text-sm font-semibold text-deep">
                {DOCUMENT_TYPE_ICONO_CATEGORY_LABEL}
              </label>
              <FieldHelpModalButton onClick={() => setHelpKey("icono")} />
            </div>
            <Controller
              name="type_iconographique"
              control={control}
              render={({ field }) => (
                <DocumentTypeIconographiqueSelect
                  id="doc-wizard-type-icono"
                  value={(field.value ?? "") as DocumentCategorieIconographiqueId | ""}
                  onChange={(v) => field.onChange(v === "" ? null : v)}
                  showDescription={false}
                  showLabel={false}
                />
              )}
            />
          </div>
        </div>
      )}

      <hr className="border-0 border-t border-border/70" />

      {/* 6. Source */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <label htmlFor={sourceId} className="text-sm font-semibold text-deep">
            {DOCUMENT_MODULE_SOURCE_LABEL} <RequiredMark />
          </label>
          <FieldHelpModalButton onClick={() => setHelpKey("source")} />
        </div>
        <Controller
          name="source_citation"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              id={sourceId}
              instanceId={sourceId}
              value={field.value}
              onChange={field.onChange}
              minHeight={88}
              placeholder={DOCUMENT_WIZARD_STEP1_SOURCE_ARIA_PLACEHOLDER}
              toolbarAriaLabel="Mise en forme de la source"
              aria-invalid={errors.source_citation ? true : undefined}
              aria-describedby={errors.source_citation ? sourceErrorId : undefined}
            />
          )}
        />
        {errors.source_citation ? (
          <p id={sourceErrorId} className="text-sm text-error" role="alert">
            {errors.source_citation.message}
          </p>
        ) : null}
      </div>

      {/* 7. Type de source + Repère — deux colonnes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-deep">
              {DOCUMENT_MODULE_SOURCE_TYPE_LABEL} <RequiredMark />
            </span>
            <FieldHelpModalButton onClick={() => setHelpKey("sourceType")} />
          </div>
          <Controller
            name="source_type"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                aria-label={DOCUMENT_MODULE_SOURCE_TYPE_LABEL}
                value={
                  field.value === "primaire" || field.value === "secondaire"
                    ? field.value
                    : "secondaire"
                }
                onChange={field.onChange}
                options={[...SOURCE_TYPE_SEGMENTS]}
              />
            )}
          />
          {errors.source_type ? (
            <p className="text-sm text-error" role="alert">
              {errors.source_type.message}
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-deep">{REPERE_TEMPOREL_LABEL}</span>
            <FieldHelpModalButton onClick={() => setHelpKey("repere")} />
          </div>
          <RepereTemporelField
            className="mt-1.5"
            suppressLabelAndHelp
            repereTemporelValue={watch("repere_temporel")}
            onRepereTemporelChange={(val) =>
              setValue("repere_temporel", val, { shouldValidate: true })
            }
            anneeNormaliseeValue={watch("annee_normalisee")}
            onAnneeNormaliseeChange={(val) =>
              setValue("annee_normalisee", val, { shouldValidate: true })
            }
            errorRepere={errors.repere_temporel?.message}
            errorAnnee={errors.annee_normalisee?.message}
            textInputPlaceholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_REPERE}
          />
        </div>
      </div>
    </div>
  );
}
