"use client";

import type { RefObject } from "react";
import { useCallback, useId, useState } from "react";
import { DocumentTypeIconographiqueSelect } from "@/components/documents/DocumentTypeIconographiqueSelect";
import { InlineWarning } from "@/components/ui/InlineWarning";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { DocumentLegendPositionGrid } from "@/components/documents/DocumentLegendPositionGrid";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Textarea } from "@/components/ui/Textarea";
import { DocumentSlotImageField } from "@/components/tache/wizard/bloc4/DocumentSlotImageField";
import { DocumentSlotLegendBlock } from "@/components/tache/wizard/bloc4/DocumentSlotLegendBlock";
import { DocumentSlotSourceTypeFieldset } from "@/components/tache/wizard/bloc4/DocumentSlotSourceTypeFieldset";
import { AssociationsCases } from "@/components/tache/wizard/bloc4/associations-cases";
import { ToggleLeurre } from "@/components/tache/wizard/bloc4/toggle-leurre";
import { RepereTemporelField } from "@/components/ui/RepereTemporelField";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { getDocumentTypeIcon } from "@/lib/tache/document-categories-helpers";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import {
  BLOC4_WARNING_NO_SOURCE,
  BLOC4_WARNING_NO_TITLE,
  DOCUMENT_MODULE_SOURCE_FORMAT_HINT,
  DOCUMENT_MODULE_SOURCE_LABEL,
  DOCUMENT_MODULE_SOURCE_PLACEHOLDER,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_WIZARD_TYPE_DOC_LABEL,
} from "@/lib/ui/ui-copy";
type Props = {
  slot: DocumentSlotData;
  slotId: DocumentSlotId;
  numero: number;
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
  slotId,
  numero,
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
  const { state } = useTacheForm();
  const parcours = resoudreParcours(state.bloc2.typeTache);
  const estDossierCd1 = parcours.bloc4Type === "dossier_cd1";
  const typeDocGroupId = useId();
  const iconoCategoryId = useId();
  const sourceHintId = `${sourceId}-hint`;

  // Track des champs visités pour conditionner les avertissements non-bloquants.
  // Les bannières InlineWarning ne s'affichent qu'après que l'utilisateur a
  // interagi avec le champ (onBlur) — pas au premier rendu.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = useCallback((field: string) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const docTypeOptions = [
    {
      value: "textuel",
      label: DOCUMENT_MODULE_TYPE_TEXT,
      icon: (
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          {getDocumentTypeIcon("textuel")}
        </span>
      ),
    },
    {
      value: "iconographique",
      label: DOCUMENT_MODULE_TYPE_IMAGE,
      icon: (
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          {getDocumentTypeIcon("iconographique")}
        </span>
      ),
    },
  ] as const;

  return (
    <div className="space-y-5 px-4 pb-5 pt-4 sm:px-5">
      <div className="space-y-2">
        <p id={typeDocGroupId} className="text-sm font-semibold text-deep">
          {DOCUMENT_WIZARD_TYPE_DOC_LABEL} <RequiredMark />
        </p>
        <SegmentedControl
          aria-labelledby={typeDocGroupId}
          value={slot.type}
          onChange={(v) => {
            if (v === "textuel") {
              patch({ type: "textuel", type_iconographique: null });
            } else if (v === "iconographique") {
              patch({ type: "iconographique" });
            }
          }}
          options={[...docTypeOptions]}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={titreId} className="text-sm font-semibold text-deep">
          Titre {slot.type === "iconographique" ? <RequiredMark /> : null}
        </label>
        <input
          id={titreId}
          type="text"
          value={slot.titre}
          onChange={(e) => patch({ titre: e.target.value })}
          onBlur={() => markTouched("titre")}
          placeholder="Titre du document"
          autoComplete="off"
          className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep placeholder:text-muted"
        />
        {touched.titre && slot.type === "textuel" && slot.titre.trim().length === 0 ? (
          <InlineWarning>{BLOC4_WARNING_NO_TITLE}</InlineWarning>
        ) : null}
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
          <Textarea
            id={contenuId}
            value={slot.contenu}
            onChange={(e) => patch({ contenu: e.target.value })}
            placeholder="Saisir le contenu textuel du document…"
            rows={6}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DocumentTypeIconographiqueSelect
            id={iconoCategoryId}
            value={slot.type_iconographique ?? ""}
            onChange={(v) => patch({ type_iconographique: v === "" ? null : v })}
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-deep">
              Image du document <RequiredMark />
            </p>
            <DocumentSlotImageField
              slot={slot}
              numero={numero}
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

      {}
      <div className="space-y-2" onBlur={() => markTouched("source")}>
        <label htmlFor={sourceId} className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_SOURCE_LABEL}
        </label>
        <p id={sourceHintId} className="text-xs text-muted">
          {DOCUMENT_MODULE_SOURCE_PLACEHOLDER} {DOCUMENT_MODULE_SOURCE_FORMAT_HINT}
        </p>
        <RichTextEditor
          id={sourceId}
          instanceId={sourceId}
          value={slot.source_citation}
          onChange={(html) => patch({ source_citation: html })}
          minHeight={88}
          toolbarAriaLabel="Mise en forme de la source"
          aria-describedby={sourceHintId}
        />
        {touched.source && !htmlHasMeaningfulText(slot.source_citation) ? (
          <InlineWarning>{BLOC4_WARNING_NO_SOURCE}</InlineWarning>
        ) : null}
      </div>

      <DocumentSlotSourceTypeFieldset slot={slot} patch={patch} />

      {estDossierCd1 ? (
        <div className="space-y-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <ToggleLeurre slotId={slotId} />
          {!slot.estLeurre ? <AssociationsCases slotId={slotId} /> : null}
        </div>
      ) : null}

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
