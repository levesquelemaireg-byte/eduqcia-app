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

/**
 * Identifiants des catégories iconographiques (union littérale).
 *
 * Cette union doit rester strictement synchronisée avec le tableau du JSON
 * `public/data/document-categories.json` clé `iconographiques`. Un test
 * unitaire (`document-categories-helpers.test.ts`) vérifie cette cohérence.
 *
 * Anciennement défini comme `DocumentTypeIconoSlug` dans `lib/ui/ui-copy.ts`,
 * désormais centralisé ici depuis le commit Chantier 3 (D-Coexistence).
 */
export type DocumentCategorieIconographiqueId =
  | "carte"
  | "photographie"
  | "peinture"
  | "dessin_gravure"
  | "affiche_caricature"
  | "planche_didactique"
  | "objet_artefact"
  | "autre";

/** Catégorie iconographique (carte, peinture, photographie, etc.). */
export type DocumentCategorieIconographique = {
  id: DocumentCategorieIconographiqueId;
  label: string;
  icon: string;
  /** Libellé compact pour les badges de la banque (5-8 caractères max). */
  badge_short: string;
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
