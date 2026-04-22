import { z } from "zod";

import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";

/**
 * Schéma Zod aligné sur les ids du JSON `public/data/document-categories.json`
 * clé `iconographiques`. Source de vérité unique : le JSON, lu via les helpers
 * `lib/tache/document-categories-helpers.ts`.
 *
 * L'ancien tableau hardcodé `DOCUMENT_TYPE_ICONO_SLUGS` (dans `lib/ui/ui-copy.ts`)
 * a été supprimé au commit Chantier 3 (D-Coexistence Option A). Le type
 * `DocumentCategorieIconographiqueId` (union littérale) vit dans
 * `lib/types/document-categories.ts` et garantit la cohérence par construction.
 */

const ICONO_VALUES = [
  "carte",
  "photographie",
  "peinture",
  "dessin_gravure",
  "affiche_caricature",
  "planche_didactique",
  "objet_artefact",
  "autre",
] as const satisfies readonly DocumentCategorieIconographiqueId[];

export const typeIconographiqueSchema = z.enum(ICONO_VALUES);

export type TypeIconographiqueValue = DocumentCategorieIconographiqueId;

/**
 * Parse une valeur libre vers `DocumentCategorieIconographiqueId`. Retourne `null` si :
 *   - la valeur est `null` / `undefined` / chaîne vide,
 *   - ou la chaîne ne correspond à aucune valeur de l'enum.
 */
export function parseTypeIconographique(raw: unknown): DocumentCategorieIconographiqueId | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s.length === 0) return null;
  const r = typeIconographiqueSchema.safeParse(s);
  return r.success ? r.data : null;
}
