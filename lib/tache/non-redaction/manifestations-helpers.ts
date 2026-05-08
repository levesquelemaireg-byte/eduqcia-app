/**
 * Logique pure du parcours non-rédactionnel `manifestations` (OI5 — Mettre en relation des faits).
 *
 * Contient :
 * - Helpers de structure : nombre de catégories, docs par catégorie, total de docs.
 * - Validation des associations (chaque doc assigné exactement une fois, sans doublon).
 * - Migrations `organisationCategories` 2 ↔ 4 (préservation des catégories saisies).
 *
 * Pas de dépendance UI ni de Zod ici — facilement testable sans hydratation.
 */

export type ManifestationsComportementId = "5.1" | "5.2";
export type OrganisationCategories = "2-categories" | "4-categories";

/* -------------------------------------------------------------------------- */
/*  Structure : nombre de catégories, docs par catégorie, total de docs       */
/* -------------------------------------------------------------------------- */

/** Nombre de catégories à saisir au Bloc 3 selon comportement + organisation. */
export function getCategoryCount(
  comportementId: ManifestationsComportementId,
  organisation: OrganisationCategories,
): number {
  if (comportementId === "5.1") return 2;
  // 5.2
  return organisation === "4-categories" ? 4 : 2;
}

/** Nombre de documents à assigner par catégorie au Bloc 5. */
export function getDocsPerCategory(
  comportementId: ManifestationsComportementId,
  organisation: OrganisationCategories,
): number {
  if (comportementId === "5.1") return 1;
  // 5.2
  return organisation === "4-categories" ? 1 : 2;
}

/** Nombre total de documents historiques (Bloc 4). 5.1 → 2, 5.2 → 4. */
export function getTotalDocumentCount(comportementId: ManifestationsComportementId): number {
  return comportementId === "5.1" ? 2 : 4;
}

/* -------------------------------------------------------------------------- */
/*  Validation des associations                                                */
/* -------------------------------------------------------------------------- */

/**
 * Vérifie qu'un tableau d'associations couvre tous les documents exactement
 * une fois, sans doublon, avec des numéros valides dans `[1, expectedDocCount]`.
 *
 * - `associations[i]` = numéros de documents assignés à la catégorie d'index `i`.
 * - `expectedCategoryCount` : nombre de catégories attendu.
 * - `expectedDocsPerCategory` : nombre de documents attendu par catégorie.
 * - `expectedDocCount` : total de documents disponibles (= categoryCount × docsPerCategory).
 */
export function validateAssociationsNoDoublon(
  associations: number[][],
  expectedCategoryCount: number,
  expectedDocsPerCategory: number,
  expectedDocCount: number,
): boolean {
  if (associations.length !== expectedCategoryCount) return false;

  const allDocs: number[] = [];
  for (const cat of associations) {
    if (cat.length !== expectedDocsPerCategory) return false;
    for (const n of cat) {
      if (!Number.isInteger(n) || n < 1 || n > expectedDocCount) return false;
      allDocs.push(n);
    }
  }

  if (allDocs.length !== expectedDocCount) return false;
  const uniqueDocs = new Set(allDocs);
  return uniqueDocs.size === allDocs.length;
}

/* -------------------------------------------------------------------------- */
/*  Migrations organisation 2 ↔ 4                                              */
/* -------------------------------------------------------------------------- */

/**
 * Migration 2-categories → 4-categories.
 * Conserve les 2 catégories saisies, ajoute 2 vides à la fin.
 * Réinitialise les associations (la structure change).
 */
export function migrateCategoriesFor4(categories: string[]): string[] {
  const first = categories[0] ?? "";
  const second = categories[1] ?? "";
  return [first, second, "", ""];
}

/**
 * Migration 4-categories → 2-categories.
 * Conserve les 2 premières catégories saisies (perte des 2 dernières acceptée).
 * Réinitialise les associations.
 */
export function migrateCategoriesFor2(categories: string[]): string[] {
  const first = categories[0] ?? "";
  const second = categories[1] ?? "";
  return [first, second];
}

/** Tableau d'associations vide pour `n` catégories. */
export function emptyAssociations(categoryCount: number): number[][] {
  return Array.from({ length: categoryCount }, () => []);
}
