import { z } from "zod";

/** Entrée brute champ recherche (wizard Bloc 1). */
export const rawCollaborateurSearchSchema = z.string().max(80);

export function sanitizeCollaborateurSearchTerm(s: string): string {
  return s.trim().replace(/%/g, "").replace(/_/g, "").replace(/"/g, "");
}
