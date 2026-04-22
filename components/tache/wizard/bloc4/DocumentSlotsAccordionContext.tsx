"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";

type DocumentSlotsAccordionContextValue = {
  expandedSlotId: DocumentSlotId | null;
  toggleSlot: (slotId: DocumentSlotId) => void;
  setExpandedSlotId: Dispatch<SetStateAction<DocumentSlotId | null>>;
};

const DocumentSlotsAccordionContext = createContext<DocumentSlotsAccordionContextValue | null>(
  null,
);

export function DocumentSlotsAccordionProvider({
  initialExpandedSlotId,
  children,
}: {
  initialExpandedSlotId: DocumentSlotId;
  children: ReactNode;
}) {
  const [expandedSlotId, setExpandedSlotId] = useState<DocumentSlotId | null>(
    initialExpandedSlotId,
  );

  const toggleSlot = useCallback((slotId: DocumentSlotId) => {
    setExpandedSlotId((prev) => (prev === slotId ? null : slotId));
  }, []);

  return (
    <DocumentSlotsAccordionContext.Provider
      value={{ expandedSlotId, toggleSlot, setExpandedSlotId }}
    >
      {children}
    </DocumentSlotsAccordionContext.Provider>
  );
}

export function useDocumentSlotsAccordion(): DocumentSlotsAccordionContextValue {
  const ctx = useContext(DocumentSlotsAccordionContext);
  if (!ctx) {
    throw new Error("useDocumentSlotsAccordion must be used within DocumentSlotsAccordionProvider");
  }
  return ctx;
}
