import type { TaeFicheData } from "@/lib/types/fiche";

export type RailDocumentsCompteData = {
  /** Texte formaté prêt à l'affichage : "1 document" ou "N documents" */
  texte: string;
};

export function selectRailDocumentsCompte(state: TaeFicheData): RailDocumentsCompteData | null {
  const n = state.documents.length;
  if (n === 0) return null;
  return { texte: n === 1 ? "1 document" : `${n} documents` };
}
