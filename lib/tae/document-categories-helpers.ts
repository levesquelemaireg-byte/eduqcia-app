/**
 * Helpers purs — registre des catégories de documents.
 *
 * Source de vérité unique : `public/data/document-categories.json`.
 * Le JSON est importé statiquement (Next.js le bundle, aucun fetch runtime).
 *
 * Ce module est l'unique point d'accès aux catégories textuelles, iconographiques
 * et aux types de source. Aucun consommateur ne doit hardcoder ces listes ailleurs.
 */

import documentCategoriesJson from "@/public/data/document-categories.json";
import type {
  DocumentCategoriesData,
  DocumentCategorieIconographique,
  DocumentCategorieTextuelle,
  DocumentType,
  DocumentTypeSource,
} from "@/lib/types/document-categories";

const data = documentCategoriesJson as DocumentCategoriesData;

// ---------------------------------------------------------------------------
// Catégories textuelles
// ---------------------------------------------------------------------------

/** Toutes les catégories textuelles, dans l'ordre du JSON. */
export function getAllCategoriesTextuelles(): DocumentCategorieTextuelle[] {
  return data.textuelles;
}

/** Catégorie textuelle par id, ou `null` si l'id est inconnu. */
export function getDocumentCategorieTextuelle(id: string): DocumentCategorieTextuelle | null {
  return data.textuelles.find((c) => c.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Catégories iconographiques
// ---------------------------------------------------------------------------

/** Toutes les catégories iconographiques, dans l'ordre du JSON. */
export function getAllCategoriesIconographiques(): DocumentCategorieIconographique[] {
  return data.iconographiques;
}

/** Catégorie iconographique par id, ou `null` si l'id est inconnu. */
export function getDocumentCategorieIconographique(
  id: string,
): DocumentCategorieIconographique | null {
  return data.iconographiques.find((c) => c.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Types de source
// ---------------------------------------------------------------------------

/** Tous les types de source (primaire / secondaire). */
export function getAllTypesSource(): DocumentTypeSource[] {
  return data.types_source;
}

/** Type de source par id, ou `null` si l'id est inconnu. */
export function getDocumentTypeSource(id: string): DocumentTypeSource | null {
  return data.types_source.find((t) => t.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Helpers icônes
// ---------------------------------------------------------------------------

/**
 * Retourne le nom de l'icône Material Symbols associée à un id de catégorie,
 * ou `null` si l'id n'existe ni dans les textuelles ni dans les iconographiques.
 *
 * Ce helper est utile quand on ne sait pas si l'id est textuel ou iconographique
 * (ex. affichage générique d'un document dans la banque).
 */
export function getCategoryIcon(categorieId: string): string | null {
  const textuelle = getDocumentCategorieTextuelle(categorieId);
  if (textuelle) return textuelle.icon;
  const iconographique = getDocumentCategorieIconographique(categorieId);
  if (iconographique) return iconographique.icon;
  return null;
}

/**
 * Icône générale d'un type de document — utilisée pour les toggles, en-têtes,
 * badges et fallbacks « Autre ». Source de vérité unique : ne jamais hardcoder
 * ces icônes ailleurs dans le code.
 *
 * Cf. DESIGN-SYSTEM.md § « Icônes des types de document ».
 */
export function getDocumentTypeIcon(type: DocumentType): string {
  return type === "textuel" ? "article" : "image_inset";
}
