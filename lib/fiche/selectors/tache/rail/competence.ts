import type { TaeFicheData } from "@/lib/types/fiche";
import type { CdSelection } from "@/lib/types/fiche";

export type RailCompetenceData = {
  /** Libellé racine de la compétence (ex. "Interpréter une réalité sociale") */
  racine: string;
  /** Arbre complet pour le rendu déplié */
  cd: CdSelection;
};

export function selectRailCompetence(state: TaeFicheData): RailCompetenceData | null {
  if (!state.cd) return null;
  return {
    racine: state.cd.competence,
    cd: state.cd,
  };
}
