import type { TaeFicheData } from "@/lib/types/fiche";

export function selectRailAuteur(state: TaeFicheData): { nom: string } {
  const premier = state.auteurs[0];
  return { nom: premier?.full_name ?? "Auteur inconnu" };
}
