/**
 * Selectors for document fiches — accept DocFicheData (pre-processed server data).
 * Simple selectors: data is already resolved, just transform for section components.
 */

import { ready, sanitize } from "@/lib/fiche/helpers";
import { htmlHasMeaningfulText } from "@/lib/tache/consigne-helpers";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";
import { iconForDocumentStructure } from "@/lib/ui/icons/document-structure-icon";
import {
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_SOURCE_PRIMAIRE,
  DOCUMENT_MODULE_SOURCE_SECONDAIRE,
  documentStructureBadgeLabel,
} from "@/lib/ui/ui-copy";
import type {
  SectionState,
  SelectorRefs,
  DocFicheData,
  DocHeaderData,
  DocContentData,
  DocIndexationData,
  DocFooterData,
} from "@/lib/fiche/types";

/** Header — title + type pills. Always ready. */
export function selectDocHeader(
  state: DocFicheData,
  _refs: SelectorRefs,
): SectionState<DocHeaderData> {
  const firstEl = state.document.elements[0];
  const docType = firstEl?.type === "iconographique" ? "iconographique" : "textuel";

  return ready({
    titre: state.document.titre,
    typeLabel: docType === "textuel" ? DOCUMENT_MODULE_TYPE_TEXT : DOCUMENT_MODULE_TYPE_IMAGE,
    structureLabel: documentStructureBadgeLabel(
      state.document.structure,
      state.document.elements.length,
    ),
    structureIcon: iconForDocumentStructure(
      state.document.structure,
      state.document.elements.length,
    ),
    sourceTypeLabel:
      state.sourceType === "primaire"
        ? DOCUMENT_MODULE_SOURCE_PRIMAIRE
        : DOCUMENT_MODULE_SOURCE_SECONDAIRE,
  });
}

/** Document content — the rendered document card. Always ready. */
export function selectDocContent(
  state: DocFicheData,
  _refs: SelectorRefs,
): SectionState<DocContentData> {
  return ready({ document: state.document });
}

/** Indexation metadata — classification fields. Always ready. */
export function selectDocIndexation(
  state: DocFicheData,
  _refs: SelectorRefs,
): SectionState<DocIndexationData> {
  const firstEl = state.document.elements[0];
  const docType = firstEl?.type === "iconographique" ? "iconographique" : "textuel";

  return ready({
    typeLabel: docType === "textuel" ? DOCUMENT_MODULE_TYPE_TEXT : DOCUMENT_MODULE_TYPE_IMAGE,
    sourceTypeLabel:
      state.sourceType === "primaire"
        ? DOCUMENT_MODULE_SOURCE_PRIMAIRE
        : DOCUMENT_MODULE_SOURCE_SECONDAIRE,
    sourceCitationHtml: htmlHasMeaningfulText(state.sourceCitation)
      ? sanitize(sourceCitationDisplayHtml(state.sourceCitation))
      : null,
    niveauLabels: state.niveauLabels,
    disciplineLabels: state.disciplineLabels,
    aspectsStr: state.aspectsStr,
    connLabels: state.connLabels,
  });
}

/** Footer — author, date, usage count, publication status. Always ready. */
export function selectDocFooter(
  state: DocFicheData,
  _refs: SelectorRefs,
): SectionState<DocFooterData> {
  return ready({
    authorName: state.authorName,
    created: state.created,
    usageCaption: state.usageCaption,
    isPublished: state.isPublished,
  });
}
