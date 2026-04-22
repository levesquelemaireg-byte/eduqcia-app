import type { TacheFicheData } from "@/lib/types/fiche";

export function selectRailStatut(state: TacheFicheData): { statut: "brouillon" | "publiee" } {
  return { statut: state.is_published ? "publiee" : "brouillon" };
}
