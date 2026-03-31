import type { DisciplineOption, NiveauOption } from "@/lib/queries/document-ref-data";
import { refIdsEqual } from "@/lib/documents/ref-id";
import {
  disciplinesForNiveau,
  type DisciplineCode,
  type NiveauCode,
} from "@/lib/tae/blueprint-helpers";

/**
 * Filtre les disciplines DB selon le niveau — même règle que le Bloc 2 TAÉ (`disciplinesForNiveau`).
 */
export function filterDisciplinesForDocumentNiveau(
  allDisciplines: DisciplineOption[],
  niveaux: NiveauOption[],
  niveauId: number,
): DisciplineOption[] {
  if (!niveauId || niveauId <= 0) return [];
  const row = niveaux.find((n) => refIdsEqual(n.id, niveauId));
  if (!row?.code) return [];
  const allowed = new Set(disciplinesForNiveau(row.code as NiveauCode).map((c) => c.toLowerCase()));
  return allDisciplines.filter((d) => allowed.has(String(d.code).toLowerCase() as DisciplineCode));
}
