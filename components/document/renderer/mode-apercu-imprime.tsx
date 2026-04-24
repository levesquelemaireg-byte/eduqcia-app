import { DocumentCardPrint } from "@/components/documents/DocumentCardPrint";
import type { RendererDocument } from "@/lib/types/document-renderer";

type Props = {
  document: RendererDocument;
  numero?: number;
};

/** Façade transitoire — délègue à DocumentCardPrint avant l'absorption du code (Commit 1e). */
export function ModeApercuImprime({ document, numero }: Props) {
  return <DocumentCardPrint document={document} numero={numero} />;
}
