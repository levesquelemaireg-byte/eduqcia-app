import type { RendererDocument } from "@/lib/types/document-renderer";
import { ModeSommaire } from "./mode-sommaire";

export type DocumentRendererProps = {
  document: RendererDocument;
  /** Numéro affiché dans le bandeau (1, 2, 3…). */
  numero?: number;
};

/**
 * Point d'entrée unique pour rendre un document historique dans un panneau
 * sommaire (fiche tâche, vue détaillée). Le rendu d'impression utilise
 * désormais `DossierGrille` directement (`components/epreuve/impression/dossier/`).
 *
 * La variante `miniature` reste séparée dans `components/document/miniature/`
 * (type `DocumentEnrichedRow`, contrat de données différent).
 */
export function DocumentRenderer({ document, numero }: DocumentRendererProps) {
  return <ModeSommaire document={document} numero={numero} />;
}
