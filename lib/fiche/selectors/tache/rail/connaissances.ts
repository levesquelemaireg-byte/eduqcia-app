import type { TacheFicheData } from "@/lib/types/fiche";
import type { ConnaissanceSelection } from "@/lib/types/fiche";

export type RailConnaissancesData = {
  /** Dernier énoncé de l'arbre (le plus spécifique) */
  terminal: string;
  /** Données complètes pour le rendu déplié */
  connaissances: ConnaissanceSelection[];
};

export function selectRailConnaissances(state: TacheFicheData): RailConnaissancesData | null {
  if (state.connaissances.length === 0) return null;

  // Dernier énoncé = le plus spécifique de la dernière connaissance
  const last = state.connaissances[state.connaissances.length - 1];
  const terminal = last.enonce;

  return { terminal, connaissances: state.connaissances };
}
