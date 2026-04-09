import { z } from "zod";

import type { Database } from "@/lib/types/database";

/**
 * Schéma Zod aligné sur l'enum SQL `document_categorie_textuelle`.
 *
 * Source de vérité produit : `public/data/document-categories.json` clé `textuelles`.
 * Source de vérité technique : enum SQL côté DB (cf. `supabase/schema.sql`
 * et `supabase/migrations/20260409120000_documents_categorie_textuelle.sql`).
 *
 * Pattern parallèle à `lib/documents/type-iconographique.ts` mais avec une
 * contrainte ENUM stricte côté DB (D-Chantier3-DB Option B) — pas seulement
 * côté Zod comme pour les iconographiques.
 */
export type CategorieTextuelleValue = Database["public"]["Enums"]["document_categorie_textuelle"];

const CATEGORIE_TEXTUELLE_VALUES = [
  "documents_officiels",
  "ecrits_personnels",
  "presse_publications",
  "discours_prises_parole",
  "textes_savants",
  "donnees_statistiques",
  "textes_litteraires_culturels",
  "autre",
] as const satisfies readonly CategorieTextuelleValue[];

export const categorieTextuelleSchema = z.enum(CATEGORIE_TEXTUELLE_VALUES);

/**
 * Parse une valeur libre vers une `CategorieTextuelleValue`. Retourne `null` si :
 *   - la valeur est `null` / `undefined` / chaîne vide,
 *   - ou la chaîne ne correspond à aucune valeur de l'enum.
 */
export function parseCategorieTextuelle(raw: unknown): CategorieTextuelleValue | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s.length === 0) return null;
  const r = categorieTextuelleSchema.safeParse(s);
  return r.success ? r.data : null;
}
