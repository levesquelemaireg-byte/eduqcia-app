/**
 * SectionDocument — délègue au renderer canonique DocumentRenderer.
 *
 * Invariant #5 du print-engine : ApercuImpression → SectionDocument → DocumentRenderer (mode apercu-imprime).
 */

import { DocumentRenderer } from "@/components/document/renderer";
import type { RendererDocument } from "@/lib/types/document-renderer";

export type ContenuDocument = {
  numeroGlobal: number;
  document: RendererDocument;
};

export type SectionDocumentProps = {
  contenu: ContenuDocument;
};

export function SectionDocument({ contenu }: SectionDocumentProps) {
  return (
    <DocumentRenderer
      document={contenu.document}
      mode="apercu-imprime"
      numero={contenu.numeroGlobal}
    />
  );
}
