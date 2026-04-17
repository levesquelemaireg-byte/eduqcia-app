/**
 * Adaptateur DocumentFiche -> RendererDocument.
 *
 * Utilisé quand le pipeline fournit des DocumentFiche (wizard state,
 * selectors TaeFicheData) mais que le composant canonique attend un
 * RendererDocument.
 *
 * Si `doc.rendererDocument` est déjà hydraté (multi-éléments),
 * il est retourné tel quel.
 */

import type { DocumentFiche } from "@/lib/types/fiche";
import type {
  IconographiqueElement,
  RendererDocument,
  TextuelElement,
} from "@/lib/types/document-renderer";

export function documentFicheVersRenderer(doc: DocumentFiche): RendererDocument {
  if (doc.rendererDocument) return doc.rendererDocument;

  const id = `fiche_${doc.letter}`;
  const elementId = `${id}_0`;

  const base = {
    id: elementId,
    source: doc.source_citation,
    sourceType: (doc.sourceType ?? "primaire") as "primaire" | "secondaire",
  };

  const element: TextuelElement | IconographiqueElement =
    doc.type === "textuel"
      ? ({
          ...base,
          type: "textuel" as const,
          contenu: doc.contenu,
          categorieTextuelle: "autre" as const,
        } satisfies TextuelElement)
      : ({
          ...base,
          type: "iconographique" as const,
          imageUrl: doc.image_url ?? "",
          categorieIconographique: "autre" as const,
          ...(doc.imageLegende ? { legende: doc.imageLegende } : {}),
          ...(doc.imageLegendePosition ? { legendePosition: doc.imageLegendePosition } : {}),
          ...(doc.imagePixelWidth != null ? { imagePixelWidth: doc.imagePixelWidth } : {}),
          ...(doc.imagePixelHeight != null ? { imagePixelHeight: doc.imagePixelHeight } : {}),
        } satisfies IconographiqueElement);

  return {
    id,
    titre: doc.titre,
    structure: "simple",
    elements: [element],
  };
}
