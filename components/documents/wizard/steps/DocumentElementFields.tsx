"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { DocumentCategorieTextuelleSelect } from "@/components/documents/DocumentCategorieTextuelleSelect";
import { DocumentLegendPositionGrid } from "@/components/documents/DocumentLegendPositionGrid";
import { DocumentLegendTextField } from "@/components/documents/DocumentLegendTextField";
import { DocumentTypeIconographiqueSelect } from "@/components/documents/DocumentTypeIconographiqueSelect";
import { FieldLayout } from "@/components/ui/FieldLayout";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { SimpleModal } from "@/components/ui/SimpleModal";
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
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_SOURCE_TYPE_TITLE,
  DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_BODY,
  DOCUMENT_WIZARD_STEP1_HELP_TYPE_ICONO_TITLE,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_CONTENU,
  DOCUMENT_WIZARD_STEP1_PLACEHOLDER_LEGENDE,
  DOCUMENT_WIZARD_STEP1_SOURCE_ARIA_PLACEHOLDER,
  DOCUMENT_WIZARD_TYPE_DOC_LABEL,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  TOAST_DOCUMENT_IMAGE_UPLOAD_AUTH,
  TOAST_DOCUMENT_IMAGE_UPLOAD_FAILED,
} from "@/lib/ui/ui-copy";
import { getDocumentTypeIcon, getDocumentTypeSource } from "@/lib/tae/document-categories-helpers";
import { cn } from "@/lib/utils/cn";
import stepStyles from "./step-document.module.css";

function SegmentIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined text-[1.1em]" aria-hidden="true">
      {name}
    </span>
  );
}

type HelpKey = "file" | "legende" | "icono" | "source" | "sourceType" | "contenu" | null;

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

type Props = {
  /** Préfixe de chemin dans le formulaire (ex. "elements.0", "elements.1"). */
  prefix: `elements.${number}`;
  showAuteur?: boolean;
  showRepereTemporel?: boolean;
  showSousTitre?: boolean;
};

/**
 * Champs d'un élément de document — réutilisé par StepDocument (simple)
 * et les accordéons multi-éléments (perspectives, deux_temps).
 * Utilise `FieldLayout` pour un espacement label uniforme.
 */
export function DocumentElementFields({
  prefix,
  showAuteur,
  showRepereTemporel,
  showSousTitre,
}: Props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AutonomousDocumentFormValues>();

  const typeDocId = useId();
  const sourceId = useId();
  const contenuEditorId = useId();
  const auteurId = `${prefix}-auteur`;
  const repereId = `${prefix}-repere`;
  const sousTitreId = `${prefix}-soustitre`;
  const catTextId = `${prefix}-cat-text`;
  const typeIconoId = `${prefix}-type-icono`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadMeta, setImageUploadMeta] = useState<DocumentImageUploadMeta | null>(null);
  const [helpKey, setHelpKey] = useState<HelpKey>(null);

  const docType = watch(`${prefix}.type`);
  const imageLegende = watch(`${prefix}.image_legende`);
  const imageUrl = watch(`${prefix}.image_url`);
  const titre = watch("titre");
  const legendTrimmed = (imageLegende ?? "").trim();
  const showLegendPosition = legendTrimmed.length > 0;
  const legendWords = countWordsFr(imageLegende ?? "");

  const elIndex = Number(prefix.split(".")[1]);
  const elErrors = errors.elements?.[elIndex];

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        setValue(`${prefix}.image_url`, "");
        setValue(`${prefix}.image_intrinsic_width`, undefined);
        setValue(`${prefix}.image_intrinsic_height`, undefined);
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
      setValue(`${prefix}.image_url`, r.publicUrl);
      setValue(`${prefix}.image_intrinsic_width`, r.width);
      setValue(`${prefix}.image_intrinsic_height`, r.height);
      setImageUploadMeta({
        width: r.width,
        height: r.height,
        wasResized: r.wasResized,
        fileSizeBytes: r.fileSizeBytes,
      });
    },
    [setValue, prefix],
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

      {/* Type de document */}
      <FieldLayout label={DOCUMENT_WIZARD_TYPE_DOC_LABEL} htmlFor={typeDocId} required>
        <SegmentedControl
          aria-labelledby={typeDocId}
          value={docType}
          onChange={(v) => {
            setValue(`${prefix}.type`, v as "textuel" | "iconographique");
          }}
          options={[...DOC_TYPE_SEGMENTS]}
        />
      </FieldLayout>

      {/* Champs contextuels */}
      {showAuteur ? (
        <FieldLayout
          label="Acteur ou historien"
          htmlFor={auteurId}
          required
          error={elErrors?.auteur?.message}
        >
          <input
            id={auteurId}
            type="text"
            value={watch(`${prefix}.auteur`) ?? ""}
            onChange={(e) => setValue(`${prefix}.auteur`, e.target.value)}
            autoComplete="off"
            placeholder="Ex. : Louis-Joseph Papineau, chef patriote"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
          />
        </FieldLayout>
      ) : null}

      {showRepereTemporel ? (
        <FieldLayout
          label="Repère temporel"
          htmlFor={repereId}
          required
          error={elErrors?.repere_temporel?.message}
        >
          <input
            id={repereId}
            type="text"
            value={watch(`${prefix}.repere_temporel`) ?? ""}
            onChange={(e) => setValue(`${prefix}.repere_temporel`, e.target.value)}
            autoComplete="off"
            placeholder="Ex. : 1713, vers 1760"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
          />
        </FieldLayout>
      ) : null}

      {showSousTitre ? (
        <FieldLayout
          label="Sous-titre (doit contenir un repère temporel)"
          htmlFor={sousTitreId}
          required
        >
          <input
            id={sousTitreId}
            type="text"
            value={watch(`${prefix}.sous_titre`) ?? ""}
            onChange={(e) => setValue(`${prefix}.sous_titre`, e.target.value)}
            autoComplete="off"
            placeholder="Ex. : Avant la Conquête"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
          />
        </FieldLayout>
      ) : null}

      <hr className="border-0 border-t border-border/70" />

      {/* Contenu selon type */}
      {docType === "textuel" ? (
        <>
          <FieldLayout
            label={DOCUMENT_WIZARD_STEP1_CONTENU_LABEL}
            htmlFor={contenuEditorId}
            required
            labelExtra={<FieldHelpModalButton onClick={() => setHelpKey("contenu")} />}
            error={elErrors?.contenu?.message}
          >
            <Controller
              name={`${prefix}.contenu`}
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
                />
              )}
            />
          </FieldLayout>

          <FieldLayout
            label={DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL}
            htmlFor={catTextId}
            required
            error={elErrors?.categorie_textuelle?.message}
          >
            <Controller
              name={`${prefix}.categorie_textuelle`}
              control={control}
              render={({ field }) => (
                <DocumentCategorieTextuelleSelect
                  id={catTextId}
                  value={(field.value ?? "") as CategorieTextuelleValue | ""}
                  onChange={(v) => field.onChange(v === "" ? null : v)}
                  showDescription={false}
                  showLabel={false}
                />
              )}
            />
          </FieldLayout>
        </>
      ) : (
        <>
          <FieldLayout
            label={DOCUMENT_WIZARD_IMAGE_FILE_LABEL}
            htmlFor="doc-file-upload"
            required
            labelExtra={<FieldHelpModalButton onClick={() => setHelpKey("file")} />}
            error={elErrors?.image_url?.message}
          >
            {isPdfLegacy ? (
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
          </FieldLayout>

          <Controller
            name={`${prefix}.image_legende`}
            control={control}
            render={({ field }) => (
              <DocumentLegendTextField
                value={field.value ?? ""}
                onChange={field.onChange}
                legendWords={legendWords}
                showWordsError={
                  Boolean(elErrors?.image_legende) || legendWords > DOCUMENT_LEGEND_MAX_WORDS
                }
                placeholder={DOCUMENT_WIZARD_STEP1_PLACEHOLDER_LEGENDE}
                helpModalTitle={DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_TITLE}
                helpModalBody={DOCUMENT_WIZARD_STEP1_HELP_LEGENDE_BODY}
              />
            )}
          />

          {showLegendPosition ? (
            <div className={cn(stepStyles.legendReveal)}>
              <Controller
                name={`${prefix}.image_legende_position`}
                control={control}
                render={({ field }) => (
                  <DocumentLegendPositionGrid
                    value={field.value ?? null}
                    onChange={field.onChange}
                    showPositionError={Boolean(elErrors?.image_legende_position)}
                  />
                )}
              />
            </div>
          ) : null}

          <FieldLayout
            label={DOCUMENT_TYPE_ICONO_CATEGORY_LABEL}
            htmlFor={typeIconoId}
            required
            labelExtra={<FieldHelpModalButton onClick={() => setHelpKey("icono")} />}
          >
            <Controller
              name={`${prefix}.type_iconographique`}
              control={control}
              render={({ field }) => (
                <DocumentTypeIconographiqueSelect
                  id={typeIconoId}
                  value={(field.value ?? "") as DocumentCategorieIconographiqueId | ""}
                  onChange={(v) => field.onChange(v === "" ? null : v)}
                  showDescription={false}
                  showLabel={false}
                />
              )}
            />
          </FieldLayout>
        </>
      )}

      <hr className="border-0 border-t border-border/70" />

      {/* Source */}
      <FieldLayout
        label={DOCUMENT_MODULE_SOURCE_LABEL}
        htmlFor={sourceId}
        required
        labelExtra={<FieldHelpModalButton onClick={() => setHelpKey("source")} />}
        error={elErrors?.source_citation?.message}
      >
        <Controller
          name={`${prefix}.source_citation`}
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
            />
          )}
        />
      </FieldLayout>

      {/* Type de source */}
      <FieldLayout
        label={DOCUMENT_MODULE_SOURCE_TYPE_LABEL}
        htmlFor={`${prefix}-source-type`}
        required
        labelExtra={<FieldHelpModalButton onClick={() => setHelpKey("sourceType")} />}
      >
        <Controller
          name={`${prefix}.source_type`}
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
      </FieldLayout>
    </div>
  );
}
