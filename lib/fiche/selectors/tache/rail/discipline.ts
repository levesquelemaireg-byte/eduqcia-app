import type { TacheFicheData } from "@/lib/types/fiche";

export function selectRailDiscipline(state: TacheFicheData): { label: string } {
  return { label: state.discipline.label };
}
