"use server";

import { getConnaissanceOptionsForDiscipline } from "@/lib/queries/document-ref-data";

export async function documentConnaissanceOptionsAction(
  disciplineId: number,
): Promise<{ id: number; label: string }[]> {
  if (!Number.isFinite(disciplineId) || disciplineId <= 0) return [];
  return getConnaissanceOptionsForDiscipline(disciplineId);
}
