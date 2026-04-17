/**
 * Builder de bloc document — couche 1.
 *
 * Transforme un RendererDocument en Bloc imprimable.
 * Aucune connaissance de la pagination ni du contexte global.
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 1.
 */

import type { RendererDocument } from "@/lib/types/document-renderer";
import type { Bloc } from "@/lib/epreuve/pagination/types";

export type OptionsBlocDocument = {
  titreVisible: boolean;
};

/** Contenu structuré d'un bloc document (consommé par SectionDocument). */
export type ContenuBlocDocument = {
  document: RendererDocument;
};

/**
 * Construit un Bloc de type "document" à partir d'un RendererDocument.
 *
 * Si `titreVisible` est false, le titre est vidé (mode sommatif/ministériel).
 */
export function construireBlocDocument(doc: RendererDocument, options: OptionsBlocDocument): Bloc {
  const document: RendererDocument = options.titreVisible ? doc : { ...doc, titre: "" };

  return {
    id: `doc-${doc.id}`,
    kind: "document",
    content: { document } satisfies ContenuBlocDocument,
  };
}
