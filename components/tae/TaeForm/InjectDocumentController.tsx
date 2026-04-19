"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import {
  InjectDocumentModal,
  type InjectAction,
} from "@/components/tae/TaeForm/InjectDocumentModal";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tae/document-helpers";
import {
  TOAST_INJECT_DOC_FIRST_EMPTY,
  TOAST_INJECT_DOC_NOT_FOUND,
  TOAST_INJECT_DOC_REPLACED,
  TOAST_INJECT_DOC_RESET,
} from "@/lib/ui/copy/document";
import { hasMeaningfulWizardProgress } from "@/lib/tae/wizard-draft-progress";
import { stripHtml } from "@/lib/tae/consigne-helpers";

export type PendingInjection = {
  data: DocumentSlotData;
};

type Props = {
  pendingInjection: PendingInjection | null;
  injectionError: "not_found" | null;
};

function findFirstEmptySlot(
  slots: readonly { slotId: DocumentSlotId }[],
  filled: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): DocumentSlotId | null {
  for (const { slotId } of slots) {
    const existing = filled[slotId];
    if (!existing || existing.mode === "idle") return slotId;
  }
  return null;
}

function countFilledSlots(
  slots: readonly { slotId: DocumentSlotId }[],
  filled: Partial<Record<DocumentSlotId, DocumentSlotData>>,
): number {
  let n = 0;
  for (const { slotId } of slots) {
    const existing = filled[slotId];
    if (existing && existing.mode !== "idle") n += 1;
  }
  return n;
}

export function InjectDocumentController({ pendingInjection, injectionError }: Props) {
  const router = useRouter();
  const { state, dispatch } = useTaeForm();
  const [modalOpen, setModalOpen] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    if (injectionError === "not_found") {
      processedRef.current = true;
      toast.error(TOAST_INJECT_DOC_NOT_FOUND);
      router.replace("/questions/new");
      return;
    }

    if (!pendingInjection) return;

    const hasDraft = hasMeaningfulWizardProgress(state);
    if (!hasDraft) {
      processedRef.current = true;
      dispatch({
        type: "INJECT_DOCUMENT_SLOT_REPLACE",
        slotId: "doc_A",
        data: pendingInjection.data,
      });
      toast.success(TOAST_INJECT_DOC_REPLACED);
      router.replace("/questions/new");
      return;
    }

    processedRef.current = true;
    queueMicrotask(() => setModalOpen(true));
  }, [pendingInjection, injectionError, state, dispatch, router]);

  const close = () => {
    setModalOpen(false);
    router.replace("/questions/new");
  };

  const handleSelect = (action: InjectAction) => {
    if (!pendingInjection) {
      close();
      return;
    }
    const data = pendingInjection.data;

    if (action === "replace") {
      dispatch({ type: "INJECT_DOCUMENT_SLOT_REPLACE", slotId: "doc_A", data });
      toast.success(TOAST_INJECT_DOC_REPLACED);
    } else if (action === "first-empty") {
      const target = findFirstEmptySlot(state.bloc2.documentSlots, state.bloc4.documents);
      if (!target) {
        close();
        return;
      }
      dispatch({ type: "INJECT_DOCUMENT_SLOT_FIRST_EMPTY", data });
      const letter = target.replace("doc_", "") as "A" | "B" | "C" | "D";
      toast.success(TOAST_INJECT_DOC_FIRST_EMPTY(letter));
    } else {
      dispatch({ type: "RESET_DRAFT_AND_INJECT_DOCUMENT", data });
      toast.success(TOAST_INJECT_DOC_RESET);
    }
    close();
  };

  const totalSlots = state.bloc2.documentSlots.length;
  const filledSlots = countFilledSlots(state.bloc2.documentSlots, state.bloc4.documents);
  const hasFreeSlot = totalSlots > 0 && filledSlots < totalSlots;
  const draftTitle = stripHtml(state.bloc3.consigne);

  return (
    <InjectDocumentModal
      open={modalOpen}
      onClose={close}
      onSelect={handleSelect}
      draftTitle={draftTitle !== "" ? draftTitle : null}
      filledSlots={filledSlots}
      totalSlots={totalSlots}
      hasFreeSlot={hasFreeSlot}
    />
  );
}
