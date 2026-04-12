import type { TaeFicheData } from "@/lib/types/fiche";

/** Retourne le parent racine des connaissances (réalité sociale du premier élément). */
export function selectRailChapitreConnaissances(state: TaeFicheData): { racine: string } | null {
  if (state.connaissances.length === 0) return null;
  return { racine: state.connaissances[0].realite_sociale };
}
