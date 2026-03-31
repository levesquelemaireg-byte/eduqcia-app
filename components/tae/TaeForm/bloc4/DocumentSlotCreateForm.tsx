"use client";

import type { RefObject } from "react";
import { useId } from "react";
import { DocumentSourceRichEditor } from "@/components/documents/DocumentSourceRichEditor";
import { DocumentLegendPositionGrid } from "@/components/documents/DocumentLegendPositionGrid";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { DocumentSlotImageField } from "@/components/tae/TaeForm/bloc4/DocumentSlotImageField";
import { DocumentSlotLegendBlock } from "@/components/tae/TaeForm/bloc4/DocumentSlotLegendBlock";
import { DocumentSlotSourceTypeFieldset } from "@/components/tae/TaeForm/bloc4/DocumentSlotSourceTypeFieldset";
import { RepereTemporelField } from "@/components/ui/RepereTemporelField";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";
import {
  DOCUMENT_MODULE_SOURCE_FORMAT_HINT,
  DOCUMENT_MODULE_SOURCE_LABEL,
  DOCUMENT_MODULE_SOURCE_PLACEHOLDER,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_WIZARD_TYPE_DOC_LABEL,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  slot: DocumentSlotData;
  letter: string;
  titreId: string;
  sourceId: string;
  contenuId: string;
  patch: (p: Partial<DocumentSlotData>) => void;
  fileRef: RefObject<HTMLInputElement | null>;
  imageUploading: boolean;
  onImageFile: (file: File | null) => void | Promise<void>;
  onRequestChangeMode: () => void;
  legendError?: "words" | "position" | null;
};

export function DocumentSlotCreateForm({
  slot,
  letter,
  titreId,
  sourceId,
  contenuId,
  patch,
  fileRef,
  imageUploading,
  onImageFile,
  onRequestChangeMode,
  legendError = null,
}: Props) {
  const typeDocGroupId = useId();
  const sourceHintId = `${sourceId}-hint`;

  return (
    <div className="space-y-5 px-4 pb-5 pt-4 sm:px-5">
      <div className="space-y-2">
        <p id={typeDocGroupId} className="text-sm font-semibold text-deep">
          {DOCUMENT_WIZARD_TYPE_DOC_LABEL} <RequiredMark />
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={typeDocGroupId}>
          <button
            type="button"
            onClick={() => patch({ type: "textuel", printImpressionScale: 1 })}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ring-1 transition-colors",
              slot.type === "textuel"
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
            onClick={() => patch({ type: "iconographique" })}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ring-1 transition-colors",
              slot.type === "iconographique"
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
          Titre <RequiredMark />
        </label>
        <input
          id={titreId}
          type="text"
          value={slot.titre}
          onChange={(e) => patch({ titre: e.target.value })}
          placeholder="Titre du document"
          autoComplete="off"
          className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
        />
      </div>

      <RepereTemporelField
        repereTemporelValue={slot.repere_temporel}
        onRepereTemporelChange={(v) => patch({ repere_temporel: v })}
        anneeNormaliseeValue={slot.annee_normalisee}
        onAnneeNormaliseeChange={(v) => patch({ annee_normalisee: v })}
      />

      {slot.type === "textuel" ? (
        <div className="space-y-2">
          <label htmlFor={contenuId} className="text-sm font-semibold text-deep">
            Contenu (texte) <RequiredMark />
          </label>
          <textarea
            id={contenuId}
            value={slot.contenu}
            onChange={(e) => patch({ contenu: e.target.value })}
            placeholder="Saisir le contenu textuel du document…"
            rows={6}
            className="w-full resize-y rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-deep placeholder:text-muted"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-deep">
              Image du document <RequiredMark />
            </p>
            <DocumentSlotImageField
              slot={slot}
              letter={letter}
              fileRef={fileRef}
              imageUploading={imageUploading}
              onFile={onImageFile}
            />
          </div>
          <DocumentSlotLegendBlock slot={slot} patch={patch} legendError={legendError} />
          {slot.image_legende.trim().length > 0 ? (
            <div className="space-y-2 border-t border-border/40 pt-4">
              <DocumentLegendPositionGrid
                value={slot.image_legende_position}
                onChange={(v) => patch({ image_legende_position: v })}
                showPositionError={legendError === "position"}
              />
            </div>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={sourceId} className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_SOURCE_LABEL} <RequiredMark />
        </label>
        <p id={sourceHintId} className="text-xs text-muted">
          {DOCUMENT_MODULE_SOURCE_PLACEHOLDER} {DOCUMENT_MODULE_SOURCE_FORMAT_HINT}
        </p>
        <DocumentSourceRichEditor
          id={sourceId}
          value={slot.source_citation}
          onChange={(html) => patch({ source_citation: html })}
          aria-describedby={sourceHintId}
        />
      </div>

      <DocumentSlotSourceTypeFieldset slot={slot} patch={patch} />

      <div className="pt-1">
        <button
          type="button"
          onClick={onRequestChangeMode}
          className="text-sm font-medium text-accent hover:underline"
        >
          Changer de mode
        </button>
      </div>
    </div>
  );
}
