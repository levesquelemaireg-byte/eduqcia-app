/**
 * SectionDocument — délègue au renderer canonique DocumentCardPrint.
 *
 * Invariant #5 du print-engine : ApercuImpression → SectionDocument → DocumentCardPrint.
 */

import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
import type { RendererDocument } from "@/lib/types/document-renderer";

export type ContenuDocument = {
  numeroGlobal: number;
  document: RendererDocument;
};

export type SectionDocumentProps = {
  contenu: ContenuDocument;
};

export function SectionDocument({ contenu }: SectionDocumentProps) {
  return <DocumentCardPrint document={contenu.document} numero={contenu.numeroGlobal} />;
}
