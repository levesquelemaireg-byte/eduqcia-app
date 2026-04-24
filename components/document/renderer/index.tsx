import type { RendererDocument } from "@/lib/types/document-renderer";
import { ModeSommaire } from "./mode-sommaire";
import { ModeApercuImprime } from "./mode-apercu-imprime";

export type DocumentRendererMode = "sommaire" | "apercu-imprime";

export type DocumentRendererProps = {
  document: RendererDocument;
  mode: DocumentRendererMode;
  /** Numéro affiché dans le bandeau / en-tête (1, 2, 3…). */
  numero?: number;
};

/**
 * Point d'entrée unique pour rendre un document historique.
 *
 * - `sommaire` : rendu dans un panneau sommaire (fiche tâche, vue détaillée).
 * - `apercu-imprime` : rendu pixel-perfect pour impression / export PDF.
 *
 * La variante `miniature` reste séparée dans `components/document/miniature/`
 * (type `DocumentEnrichedRow`, contrat de données différent).
 */
export function DocumentRenderer({ document, mode, numero }: DocumentRendererProps) {
  switch (mode) {
    case "sommaire":
      return <ModeSommaire document={document} numero={numero} />;
    case "apercu-imprime":
      return <ModeApercuImprime document={document} numero={numero} />;
  }
}
