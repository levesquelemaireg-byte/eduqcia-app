import type { TacheFicheData } from "@/lib/types/fiche";

export type RailDatesData = {
  creation: string;
  miseAJour: string;
};

export function selectRailDates(state: TacheFicheData): RailDatesData {
  return {
    creation: state.created_at,
    miseAJour: state.updated_at,
  };
}
