"use client";

import { useCallback, useId, useState } from "react";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import {
  canAccessDocumentSlot,
  computeSlotStatus,
  getSlotData,
  slotLetter,
  type DocumentSlotData,
} from "@/lib/tache/document-helpers";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { useDocumentSlotsAccordion } from "@/components/tache/wizard/bloc4/DocumentSlotsAccordionContext";
import { DocumentSlotCreateForm } from "@/components/tache/wizard/bloc4/DocumentSlotCreateForm";
import { DocumentSlotIdleChoices } from "@/components/tache/wizard/bloc4/DocumentSlotIdleChoices";
import { DocumentSlotLockedCard } from "@/components/tache/wizard/bloc4/DocumentSlotLockedCard";
import { DocumentSlotPanelHeader } from "@/components/tache/wizard/bloc4/DocumentSlotPanelHeader";
import { DocumentSlotPanelModals } from "@/components/tache/wizard/bloc4/DocumentSlotPanelModals";
import { DocumentSlotReuseBlock } from "@/components/tache/wizard/bloc4/DocumentSlotReuseBlock";
import { useDocumentSlotImageUpload } from "@/components/tache/wizard/bloc4/useDocumentSlotImageUpload";
import type { BanqueDocStub } from "@/components/tache/wizard/bloc4/BanqueDocumentsStub";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";

type Props = {
  slotId: DocumentSlotId;
  slotIndex: number;
  orderedIds: DocumentSlotId[];
};

export function DocumentSlotPanel({ slotId, slotIndex, orderedIds }: Props) {
  const { state, dispatch } = useTacheForm();
  const slot = getSlotData(state.bloc4.documents, slotId);
  const status = computeSlotStatus(slot);
  const letter = slotLetter(slotId);
  const locked = !canAccessDocumentSlot(orderedIds, slotIndex, state.bloc4.documents);

  const { expandedSlotId, toggleSlot } = useDocumentSlotsAccordion();
  const open = expandedSlotId === slotId;

  const [banqueOpen, setBanqueOpen] = useState(false);
  const [changeModeOpen, setChangeModeOpen] = useState(false);
  const titreId = useId();
  const sourceId = useId();
  const contenuId = useId();

  const patch = useCallback(
    (p: Partial<DocumentSlotData>) => {
      dispatch({ type: "UPDATE_DOCUMENT_SLOT", slotId, patch: p });
    },
    [dispatch, slotId],
  );

  const { fileRef, imageUploading, handleFile, resetLocalUploadState } =
    useDocumentSlotImageUpload(patch);

  const resetSlot = useCallback(() => {
    resetLocalUploadState();
    dispatch({
      type: "UPDATE_DOCUMENT_SLOT",
      slotId,
      patch: {
        mode: "idle",
        type: "textuel",
        titre: "",
        contenu: "",
        source_citation: "",
        imageUrl: null,
        imagePixelWidth: null,
        imagePixelHeight: null,
        imageUploadMeta: null,
        source_document_id: null,
        source_version: null,
        update_available: false,
        reuse_author: "",
        reuse_source_citation: "",
        source_type: null,
        image_legende: "",
        image_legende_position: null,
        repere_temporel: "",
        annee_normalisee: null,
      },
    });
  }, [dispatch, resetLocalUploadState, slotId]);

  const handleSelectBanque = (doc: BanqueDocStub) => {
    patch({
      mode: "reuse",
      titre: doc.titre,
      source_document_id: doc.id,
      source_version: 1,
      reuse_author: "",
      reuse_source_citation: doc.source_citation,
      update_available: false,
      contenu: "",
      imageUrl: null,
      imagePixelWidth: null,
      imagePixelHeight: null,
      imageUploadMeta: null,
      source_citation: doc.source_citation,
      repere_temporel: "",
      annee_normalisee: null,
    });
    setBanqueOpen(false);
  };

  const confirmChangeMode = () => {
    resetSlot();
    setChangeModeOpen(false);
  };

  if (locked) {
    return <DocumentSlotLockedCard letter={letter} />;
  }

  const parcours = resoudreParcours(state.bloc2.typeTache);
  const pertinence =
    parcours.bloc4Type === "dossier_cd1" && slot.mode !== "idle"
      ? slot.estLeurre
        ? ({ type: "leurre" } as const)
        : { type: "pertinent" as const, nbCases: slot.casesAssociees.length }
      : null;

  return (
    <div className="overflow-hidden rounded-2xl bg-panel shadow-sm ring-1 ring-border/50">
      <DocumentSlotPanelHeader
        slotId={slotId}
        letter={letter}
        status={status}
        open={open}
        onToggle={toggleSlot}
        pertinence={pertinence}
      />

      {open ? (
        <div className="border-t border-border/50 bg-surface/40">
          {slot.mode === "idle" ? (
            <DocumentSlotIdleChoices
              onPickCreate={() => patch({ mode: "create" })}
              onPickBanque={() => setBanqueOpen(true)}
            />
          ) : null}

          {slot.mode === "create" ? (
            <DocumentSlotCreateForm
              slot={slot}
              slotId={slotId}
              letter={letter}
              titreId={titreId}
              sourceId={sourceId}
              contenuId={contenuId}
              patch={patch}
              fileRef={fileRef}
              imageUploading={imageUploading}
              onImageFile={handleFile}
              onRequestChangeMode={() => setChangeModeOpen(true)}
            />
          ) : null}

          {slot.mode === "reuse" ? (
            <DocumentSlotReuseBlock
              slot={slot}
              onRequestChangeMode={() => setChangeModeOpen(true)}
            />
          ) : null}
        </div>
      ) : null}

      <DocumentSlotPanelModals
        changeModeOpen={changeModeOpen}
        onCloseChangeMode={() => setChangeModeOpen(false)}
        onConfirmChangeMode={confirmChangeMode}
        banqueOpen={banqueOpen}
        onCloseBanque={() => setBanqueOpen(false)}
        onSelectBanque={handleSelectBanque}
      />
    </div>
  );
}
