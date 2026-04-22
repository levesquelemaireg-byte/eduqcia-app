/**
 * Selector des documents pour la vue détaillée tâche.
 * Retourne un array de RendererDocument numérotés prêts pour DocumentCard.
 */

import { documentFicheVersRenderer } from "@/lib/documents/document-fiche-vers-renderer";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";
import type { TacheFicheData } from "@/lib/types/fiche";
import type { RendererDocument } from "@/lib/types/document-renderer";

export type DocCardData = {
  numero: number;
  docId: string;
  document: RendererDocument;
};

export type DocumentsSectionData = {
  /** "Document" ou "Documents" selon le nombre */
  sectionLabel: string;
  cards: DocCardData[];
};

export function selectDocuments(state: TacheFicheData): DocumentsSectionData | null {
  if (state.documents.length === 0) return null;

  return {
    sectionLabel: ficheDocumentsSectionTitle(state.documents.length),
    cards: state.documents.map((doc, i) => ({
      numero: i + 1,
      docId: `${state.id}_doc_${doc.letter}`,
      document: documentFicheVersRenderer(doc),
    })),
  };
}
