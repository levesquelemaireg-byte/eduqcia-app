/**
 * Selector des documents pour la vue détaillée tâche.
 * Retourne un array de données prêtes pour les DocCards numérotées.
 */

import { getDocumentTypeIcon } from "@/lib/tae/document-categories-helpers";
import { ficheDocumentsSectionTitle } from "@/lib/ui/ui-copy";
import type { TaeFicheData, DocumentFiche } from "@/lib/types/fiche";

export type DocCardData = {
  numero: number;
  docId: string;
  categorieGlyph: string;
  doc: DocumentFiche;
};

export type DocumentsSectionData = {
  /** "Document" ou "Documents" selon le nombre */
  sectionLabel: string;
  cards: DocCardData[];
};

export function selectDocuments(state: TaeFicheData): DocumentsSectionData | null {
  if (state.documents.length === 0) return null;

  return {
    sectionLabel: ficheDocumentsSectionTitle(state.documents.length),
    cards: state.documents.map((doc, i) => ({
      numero: i + 1,
      docId: `${state.id}_doc_${doc.letter}`,
      categorieGlyph: getDocumentTypeIcon(doc.type),
      doc,
    })),
  };
}
