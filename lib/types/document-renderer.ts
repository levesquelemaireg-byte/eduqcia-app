/**
 * Contrat de rendu canonique pour tout affichage de document.
 * NE PAS y ajouter de métadonnées métier (droits, statut, auteur).
 * Ces données restent dans l'enveloppe parente (DonneesTache, etc.).
 *
 * Un document peut être simple (1 élément), à perspectives (2 ou 3 éléments),
 * ou à deux temps (2 éléments). Chaque élément est textuel ou iconographique
 * (discriminated union sur `type`).
 *
 * Réutilise les types existants du projet :
 * - `DocumentLegendPosition` (`lib/tache/document-helpers.ts`)
 * - `CategorieTextuelleValue` (`lib/documents/categorie-textuelle.ts`)
 * - `DocumentCategorieIconographiqueId` (`lib/types/document-categories.ts`)
 */

import type { DocumentLegendPosition } from "@/lib/tache/document-helpers";
import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";

// ---------------------------------------------------------------------------
// Structure du document
// ---------------------------------------------------------------------------

export type DocumentStructure = "simple" | "perspectives" | "deux_temps";

// ---------------------------------------------------------------------------
// Éléments (discriminated union sur `type`)
// ---------------------------------------------------------------------------

interface BaseElement {
  id: string;
  /** Auteur — obligatoire si structure = 'perspectives', optionnel sinon. */
  auteur?: string;
  /** Repère temporel — obligatoire si structure = 'deux_temps'. */
  repereTemporel?: string;
  /** Sous-titre — optionnel, utilisé si structure = 'deux_temps'. */
  sousTitre?: string;
  /** Source bibliographique (HTML riche). */
  source: string;
  /** Type de source. */
  sourceType: "primaire" | "secondaire";
}

export interface TextuelElement extends BaseElement {
  type: "textuel";
  /** Contenu riche (HTML). */
  contenu: string;
  categorieTextuelle: CategorieTextuelleValue;
}

export interface IconographiqueElement extends BaseElement {
  type: "iconographique";
  /** URL HTTPS publique de l'image. */
  imageUrl: string;
  /** Légende optionnelle (max 50 mots). */
  legende?: string;
  /** Position de la légende — obligatoire si `legende` est présente. */
  legendePosition?: DocumentLegendPosition;
  categorieIconographique: DocumentCategorieIconographiqueId;
  /** Dimensions pixel réelles de l'image (après téléversement) ; absent si inconnu. */
  imagePixelWidth?: number;
  imagePixelHeight?: number;
}

export type DocumentElement = TextuelElement | IconographiqueElement;

// ---------------------------------------------------------------------------
// Document complet
// ---------------------------------------------------------------------------

export interface RendererDocument {
  id: string;
  titre: string;
  structure: DocumentStructure;
  /** 1 pour simple, 2 ou 3 pour perspectives, 2 pour deux_temps. */
  elements: DocumentElement[];
  /** Repère temporel global (optionnel, niveau document). */
  repereTemporelDocument?: string;
}
