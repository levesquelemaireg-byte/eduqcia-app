/**
 * Builder de bloc document — couche 1.
 *
 * Transforme un DocumentReference en Bloc imprimable.
 * Aucune connaissance de la pagination ni du contexte global.
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §3, couche 1.
 */

import type { DocumentReference } from "@/lib/tache/contrats/donnees";
import type { Bloc } from "@/lib/epreuve/pagination/types";

export type OptionsBlocDocument = {
  titreVisible: boolean;
};

/** Contenu structuré d'un bloc document (consommé par SectionDocument). */
export type ContenuBlocDocument = {
  document: DocumentReference;
};

/**
 * Construit un Bloc de type "document" à partir d'une référence de document.
 *
 * Si `titreVisible` est false, le titre est vidé (mode sommatif/ministériel).
 */
export function construireBlocDocument(doc: DocumentReference, options: OptionsBlocDocument): Bloc {
  const document: DocumentReference = options.titreVisible ? doc : { ...doc, titre: "" };

  return {
    id: `doc-${doc.id}`,
    kind: "document",
    content: { document } satisfies ContenuBlocDocument,
  };
}
