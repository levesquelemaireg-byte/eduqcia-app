/**
 * Types — registre des catégories de documents (textuelles, iconographiques, types de source).
 *
 * Source de vérité unique : `public/data/document-categories.json`.
 * Chargé via les helpers de `lib/tae/document-categories-helpers.ts`.
 */

/** Catégorie textuelle (lois, écrits personnels, presse, etc.). */
export type DocumentCategorieTextuelle = {
  id: string;
  label: string;
  description: string;
  icon: string;
  exemples: string[];
};

/** Catégorie iconographique (carte, peinture, photographie, etc.). */
export type DocumentCategorieIconographique = {
  id: string;
  label: string;
  icon: string;
};

/** Type de source (primaire / secondaire). */
export type DocumentTypeSource = {
  id: "primaire" | "secondaire";
  label: string;
  icon: string;
};

/** Forme du JSON `public/data/document-categories.json`. */
export type DocumentCategoriesData = {
  textuelles: DocumentCategorieTextuelle[];
  iconographiques: DocumentCategorieIconographique[];
  types_source: DocumentTypeSource[];
};

/** Type général d'un document — utilisé pour `getDocumentTypeIcon`. */
export type DocumentType = "textuel" | "iconographique";
