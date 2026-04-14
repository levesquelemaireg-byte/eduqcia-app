import type { TaeFicheData } from "@/lib/types/fiche";
import { getDisplayName } from "@/lib/utils/profile-display";

export function selectRailAuteur(state: TaeFicheData): { nom: string } {
  const premier = state.auteurs[0];
  return {
    nom: premier ? getDisplayName(premier.first_name, premier.last_name) : "Auteur inconnu",
  };
}
