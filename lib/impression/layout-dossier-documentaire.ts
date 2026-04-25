/**
 * Moteur de layout bicolonné du dossier documentaire.
 *
 * Transforme une liste de `RendererDocument` en un ensemble de pages
 * (`PageDossier[]`), chacune composée de rangées et de cellules positionnées.
 * L'algorithme décide automatiquement du `span` (1 = demi-colonne, 2 = pleine
 * largeur) pour chaque document en fonction de la densité de contenu, puis
 * remplit la grille de gauche à droite / haut en bas, en insérant un saut de
 * page dès que la hauteur utile est dépassée.
 *
 * Le rendu CSS Grid vit dans `components/epreuve/impression/sections/document.tsx`
 * (lot B). Ce module ne produit aucun JSX — seulement la structure logique.
 *
 * La hauteur utile dépend du contexte d'impression (tâche seule vs. épreuve
 * avec en-tête) et est donc passée en paramètre, pas hardcodée.
 */

import {
  DOSSIER_GAP_VERTICAL_PX,
  DOSSIER_RANGEES_PAR_PAGE,
  HAUTEUR_LIGNE_TEXTE_PX,
  HAUTEUR_SOURCE_PX,
  HAUTEUR_TITRE_PX,
  IMAGE_MAX_HEIGHT_SPAN1_PX,
  IMAGE_MAX_HEIGHT_SPAN2_PX,
  MOTS_PAR_LIGNE_SPAN1,
  MOTS_PAR_LIGNE_SPAN2,
  SEUIL_MOTS_CONTENU_POUR_TITRE_LONG,
  SEUIL_MOTS_SPAN2,
  SEUIL_MOTS_TITRE_SPAN2,
  SEUIL_RATIO_IMAGE_SPAN2,
  SURCHARGE_ICONOGRAPHIQUE_PX,
  SURCHARGE_TEXTUEL_PX,
} from "@/lib/impression/constantes-dossier-documentaire";
import { stripHtmlToPlainText } from "@/lib/documents/strip-html";
import { countWords } from "@/lib/documents/word-count";
import type {
  DocumentStructure,
  IconographiqueElement,
  RendererDocument,
  TextuelElement,
} from "@/lib/types/document-renderer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Métriques dérivées nécessaires au placement. */
export interface DocumentAPositionner {
  /** Identifiant opaque, repris du `RendererDocument` source. */
  id: string;
  /** Numéro global 1-based, injecté par la transformation amont. */
  numero: number;
  /** Type du premier élément (pour la décision de span). */
  type: "textuel" | "iconographique";
  structure: DocumentStructure;
  /** `null` si masqué (mode sommatif) ou absent en saisie. */
  titre: string | null;
  /** Nombre de mots cumulés sur les éléments textuels du document. */
  nombreMots: number;
  /**
   * Ratio hauteur / largeur de l'image (premier élément iconographique).
   * `null` pour un document textuel ou si les dimensions sont inconnues.
   */
  imageRatio: number | null;
}

export type Span = 1 | 2;

export interface CelluleDocument {
  document: DocumentAPositionner;
  span: Span;
}

export interface Rangee {
  /** 1 cellule (span 2) ou 1-2 cellules (span 1 chacune). */
  cellules: CelluleDocument[];
}

export interface PageDossier {
  rangees: Rangee[];
}

export interface DossierDocumentaireLayout {
  pages: PageDossier[];
}

export interface OptionsLayout {
  /**
   * Hauteur utile de la zone dossier documentaire (px). À calculer par l'appelant :
   * - Hors épreuve (tâche seule / doc seul) : `HAUTEUR_UTILE_HORS_EPREUVE_PX` (905).
   * - Épreuve avec en-tête : `MAX_CONTENT_HEIGHT_PX` (825).
   */
  hauteurUtilePx: number;
}

// ---------------------------------------------------------------------------
// Dérivation des métriques depuis le RendererDocument
// ---------------------------------------------------------------------------

/**
 * Extrait les métriques nécessaires au placement.
 *
 * - `nombreMots` : somme du contenu textuel (HTML stripé) de tous les éléments.
 *   Pour un document iconographique pur, vaut 0.
 * - `imageRatio` : ratio h/w du premier élément iconographique rencontré.
 *   Fallback `1` (carré) si les dimensions sont absentes — la migration
 *   one-shot des images existantes garantit que ce cas ne survient pas en prod.
 */
export function deriverMetriquesDocument(
  doc: RendererDocument,
  numero: number,
  options?: { titreVisible?: boolean },
): DocumentAPositionner {
  const titreVisible = options?.titreVisible ?? true;
  const titre = titreVisible && doc.titre.trim().length > 0 ? doc.titre : null;

  const premierElement = doc.elements[0];
  const type = premierElement?.type ?? "textuel";

  const nombreMots = doc.elements.reduce((total, el) => {
    if (el.type !== "textuel") return total;
    return total + countWords(stripHtmlToPlainText((el as TextuelElement).contenu));
  }, 0);

  const premierIconographique = doc.elements.find(
    (el): el is IconographiqueElement => el.type === "iconographique",
  );
  const imageRatio = premierIconographique ? calculerRatio(premierIconographique) : null;

  return {
    id: doc.id,
    numero,
    type,
    structure: doc.structure,
    titre,
    nombreMots,
    imageRatio,
  };
}

function calculerRatio(el: IconographiqueElement): number {
  const w = el.imagePixelWidth;
  const h = el.imagePixelHeight;
  if (!w || !h) return 1; // fallback carré — en pratique jamais atteint après migration
  return h / w;
}

// ---------------------------------------------------------------------------
// Décision du span
// ---------------------------------------------------------------------------

export function determinerSpan(doc: DocumentAPositionner): Span {
  // Structures composites → toujours pleine largeur (2-3 perspectives ou 2 temps
  // affichés côte à côte à l'intérieur du cadre).
  if (doc.structure === "perspectives" || doc.structure === "deux_temps") return 2;

  // Texte long → pleine largeur.
  if (doc.type === "textuel" && doc.nombreMots > SEUIL_MOTS_SPAN2) return 2;

  // Image portrait très verticale → pleine largeur.
  if (
    doc.type === "iconographique" &&
    doc.imageRatio !== null &&
    doc.imageRatio > SEUIL_RATIO_IMAGE_SPAN2
  ) {
    return 2;
  }

  // Titre long + contenu conséquent → pleine largeur.
  if (
    doc.titre &&
    countWords(doc.titre) > SEUIL_MOTS_TITRE_SPAN2 &&
    doc.nombreMots > SEUIL_MOTS_CONTENU_POUR_TITRE_LONG
  ) {
    return 2;
  }

  return 1;
}

// ---------------------------------------------------------------------------
// Estimation de hauteur par cellule
// ---------------------------------------------------------------------------

/**
 * Estime la hauteur occupée par un document dans sa cellule, en pixels.
 *
 * Heuristique conservatrice : sert uniquement au placement (décider d'un saut
 * de page). Le rendu réel est contraint par CSS et n'utilise pas cette valeur.
 */
export function estimerHauteur(doc: DocumentAPositionner, span: Span): number {
  const hTitre = doc.titre ? HAUTEUR_TITRE_PX : 0;

  if (doc.type === "textuel") {
    const motsParLigne = span === 2 ? MOTS_PAR_LIGNE_SPAN2 : MOTS_PAR_LIGNE_SPAN1;
    const nbLignes = Math.max(1, Math.ceil(doc.nombreMots / motsParLigne));
    const hTexte = nbLignes * HAUTEUR_LIGNE_TEXTE_PX;
    return hTitre + hTexte + SURCHARGE_TEXTUEL_PX + HAUTEUR_SOURCE_PX;
  }

  // Iconographique : hauteur image bornée par la contrainte CSS de la cellule.
  const hImage = span === 2 ? IMAGE_MAX_HEIGHT_SPAN2_PX : IMAGE_MAX_HEIGHT_SPAN1_PX;
  return hTitre + hImage + SURCHARGE_ICONOGRAPHIQUE_PX + HAUTEUR_SOURCE_PX;
}

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

/**
 * Place la liste des documents dans une séquence de pages.
 *
 * Remplissage gauche → droite, haut → bas. Si un span 2 arrive alors que la
 * rangée courante contient déjà un span 1, la cellule droite reste vide (la
 * rangée est fermée) et le span 2 démarre une nouvelle rangée.
 *
 * Contraintes de saut de page :
 * - `DOSSIER_RANGEES_PAR_PAGE` (3) rangées maximum par page, conformément à
 *   la référence visuelle MEQ (grille 2×3).
 * - Hauteur cumulée ≤ `options.hauteurUtilePx`.
 *
 * Les deux limites déclenchent un saut de page indépendamment.
 */
export function placerDocuments(
  docs: DocumentAPositionner[],
  options: OptionsLayout,
): DossierDocumentaireLayout {
  const pages: PageDossier[] = [];
  let page: PageDossier = { rangees: [] };
  let rangee: Rangee = { cellules: [] };
  let hauteurCumulee = 0;

  const fermerPage = () => {
    if (page.rangees.length > 0) {
      pages.push(page);
      page = { rangees: [] };
    }
    hauteurCumulee = 0;
  };

  const ajouterRangeeAPage = (r: Rangee) => {
    const h = hauteurRangee(r);
    const pleine = page.rangees.length >= DOSSIER_RANGEES_PAR_PAGE;
    const deborde = hauteurCumulee > 0 && hauteurCumulee + h > options.hauteurUtilePx;
    if (pleine || deborde) {
      fermerPage();
    }
    page.rangees.push(r);
    hauteurCumulee += h + DOSSIER_GAP_VERTICAL_PX;
  };

  for (const doc of docs) {
    const span = determinerSpan(doc);

    if (span === 2) {
      // Si la rangée courante contient un span 1, la fermer (cellule droite
      // restera vide).
      if (rangee.cellules.length > 0) {
        ajouterRangeeAPage(rangee);
        rangee = { cellules: [] };
      }
      ajouterRangeeAPage({ cellules: [{ document: doc, span: 2 }] });
      continue;
    }

    // span === 1
    rangee.cellules.push({ document: doc, span: 1 });
    if (rangee.cellules.length === 2) {
      ajouterRangeeAPage(rangee);
      rangee = { cellules: [] };
    }
  }

  // Fermer les restes : rangée partielle d'abord, puis page courante.
  if (rangee.cellules.length > 0) {
    ajouterRangeeAPage(rangee);
    rangee = { cellules: [] };
  }
  if (page.rangees.length > 0) {
    pages.push(page);
  }

  return { pages };
}

function hauteurRangee(r: Rangee): number {
  if (r.cellules.length === 0) return 0;
  return r.cellules.reduce((max, c) => Math.max(max, estimerHauteur(c.document, c.span)), 0);
}
