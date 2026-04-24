import { DocumentCard } from "@/components/documents/DocumentCard";
import type { RendererDocument } from "@/lib/types/document-renderer";

type Props = {
  document: RendererDocument;
  numero?: number;
};

/** Façade transitoire — délègue à DocumentCard avant l'absorption du code (Commit 1e). */
export function ModeSommaire({ document, numero }: Props) {
  return <DocumentCard document={document} numero={numero} />;
}
