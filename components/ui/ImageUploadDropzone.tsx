"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { formatFileSizeBytesFr } from "@/lib/images/format-file-size-fr";
import type { DocumentImageUploadMeta } from "@/lib/types/document-image-upload";
import {
  DOCUMENT_WIZARD_IMAGE_DROP_HINT,
  IMAGE_UPLOAD_ACCEPT_ATTR,
  IMAGE_UPLOAD_BADGE_AUTO_RESIZED,
  IMAGE_UPLOAD_FINAL_DIMS_LABEL,
  IMAGE_UPLOAD_FINAL_SIZE_LABEL,
  IMAGE_UPLOAD_FORMATS_INFO,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export type ImageUploadSuccessMeta = DocumentImageUploadMeta;

type Props = {
  fileRef: RefObject<HTMLInputElement | null>;
  imageUploading: boolean;
  onFile: (file: File | null) => void | Promise<void>;
  /** `null` ou vide = zone vide */
  imageUrl: string | null;
  imageAlt: string;
  /** Métadonnées après succès serveur ; `null` si inconnu */
  uploadMeta: ImageUploadSuccessMeta | null;
  /** Afficher l’aperçu non optimisé (ex. `blob:`) */
  imageUnoptimized?: boolean;
  /** Appelé une fois par jeu de métadonnées distinct après succès serveur (optionnel). */
  onUploadSuccess?: (result: ImageUploadSuccessMeta) => void;
  /** Masquer le paragraphe « Formats acceptés » sous la zone (wizard document — texte en modale). */
  hideFormatsHint?: boolean;
};

/**
 * Zone dépôt + vignette document iconographique — partagée Bloc 4 TAÉ et wizard document (étape Document).
 */
export function ImageUploadDropzone({
  fileRef,
  imageUploading,
  onFile,
  imageUrl,
  imageAlt,
  uploadMeta,
  imageUnoptimized = false,
  onUploadSuccess,
  hideFormatsHint = false,
}: Props) {
  const lastMetaKey = useRef("");
  useEffect(() => {
    if (!uploadMeta) {
      lastMetaKey.current = "";
      return;
    }
    if (!onUploadSuccess) return;
    const key = `${uploadMeta.width}x${uploadMeta.height}-${uploadMeta.wasResized}-${uploadMeta.fileSizeBytes}`;
    if (key === lastMetaKey.current) return;
    lastMetaKey.current = key;
    onUploadSuccess(uploadMeta);
  }, [uploadMeta, onUploadSuccess]);

  const hasImage = Boolean(imageUrl?.trim());

  if (!hasImage) {
    return (
      <div className="space-y-2">
        <div
          role="button"
          tabIndex={0}
          aria-busy={imageUploading}
          onKeyDown={(e) => {
            if (imageUploading) return;
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-panel px-6 py-10 text-center ring-1 ring-inset ring-border/30 transition-colors",
            imageUploading
              ? "cursor-wait opacity-70"
              : "cursor-pointer hover:border-accent/40 hover:bg-accent/4 hover:ring-accent/20",
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (imageUploading) return;
            const f = e.dataTransfer.files[0];
            if (f) void onFile(f);
          }}
          onClick={() => {
            if (!imageUploading) fileRef.current?.click();
          }}
        >
          <span className="material-symbols-outlined text-[2.5em] text-muted" aria-hidden="true">
            add_photo_alternate
          </span>
          <div>
            <p className="text-sm font-medium text-deep">{DOCUMENT_WIZARD_IMAGE_DROP_HINT}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT_ATTR}
            disabled={imageUploading}
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {hideFormatsHint ? null : (
          <p className="text-xs leading-relaxed text-muted">{IMAGE_UPLOAD_FORMATS_INFO}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
        <Image
          src={imageUrl as string}
          alt={imageAlt}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
          unoptimized={imageUnoptimized}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium text-deep">
            {imageUploading ? "Envoi en cours…" : "Image du document"}
          </p>
          <p className="text-xs text-muted">
            {imageUploading
              ? "Téléversement vers le stockage sécurisé."
              : "Image hébergée — prête pour la publication."}
          </p>
          {uploadMeta && !imageUploading ? (
            <ul className="mt-2 space-y-0.5 text-xs text-muted">
              <li>
                <span className="text-deep/90">{IMAGE_UPLOAD_FINAL_DIMS_LABEL}</span>{" "}
                {uploadMeta.width} × {uploadMeta.height} px
              </li>
              <li>
                <span className="text-deep/90">{IMAGE_UPLOAD_FINAL_SIZE_LABEL}</span>{" "}
                {formatFileSizeBytesFr(uploadMeta.fileSizeBytes)}
              </li>
            </ul>
          ) : null}
          {uploadMeta?.wasResized && !imageUploading ? (
            <p className="mt-2 inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent ring-1 ring-inset ring-accent/25">
              {IMAGE_UPLOAD_BADGE_AUTO_RESIZED}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-3 text-sm text-accent">
          <button
            type="button"
            className="hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={imageUploading}
            onClick={() => fileRef.current?.click()}
          >
            Remplacer
          </button>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className="text-error hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={imageUploading}
            onClick={() => void onFile(null)}
          >
            Retirer
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_UPLOAD_ACCEPT_ATTR}
          disabled={imageUploading}
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {hideFormatsHint ? null : (
        <p className="text-xs leading-relaxed text-muted">{IMAGE_UPLOAD_FORMATS_INFO}</p>
      )}
    </div>
  );
}
