import type { TacheFicheData } from "@/lib/types/fiche";

export function selectRailNiveau(state: TacheFicheData): { label: string } {
  return { label: state.niveau.label };
}
