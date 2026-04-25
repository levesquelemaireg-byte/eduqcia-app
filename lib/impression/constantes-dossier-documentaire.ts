/**
 * Constantes du moteur de layout bicolonné pour le dossier documentaire.
 *
 * Le layout rend les documents dans une grille CSS 2 colonnes × 3 rangées
 * (6 documents par page par défaut). L'algorithme décide du span (1 ou 2)
 * selon la densité de contenu. Voir `lib/impression/layout-dossier-documentaire.ts`.
 *
 * La hauteur utile n'est pas constante : elle dépend du contexte d'impression.
 * - Tâche seule / document seul : pas d'en-tête → `PAGE_HEIGHT_PX - PAGE_MARGIN_PX`.
 * - Épreuve : en-tête fixe → `MAX_CONTENT_HEIGHT_PX` (825 px).
 * Elle est donc passée en paramètre à l'algorithme de placement.
 */

// ---------------------------------------------------------------------------
// Grille
// ---------------------------------------------------------------------------

export const DOSSIER_COLONNES = 2;
export const DOSSIER_RANGEES_PAR_PAGE = 3;
export const DOSSIER_DOCS_PAR_PAGE = DOSSIER_COLONNES * DOSSIER_RANGEES_PAR_PAGE; // 6

export const DOSSIER_GAP_HORIZONTAL_PX = 8;
export const DOSSIER_GAP_VERTICAL_PX = 10;

/** 2 cm à 96 dpi = 75.59 px, arrondi à 76 px (cohérent avec le rendu navigateur). */
const MARGE_IMPRESSION_PX = 76;

/** Hauteur Letter portrait à 96 dpi (11 × 96). */
const PAGE_HEIGHT_LETTER_PX = 1056;

/** Largeur Letter portrait à 96 dpi (8.5 × 96). */
const PAGE_WIDTH_LETTER_PX = 816;

// ---------------------------------------------------------------------------
// Hauteurs utiles par contexte
// ---------------------------------------------------------------------------

/**
 * Hauteur utile pour un dossier documentaire hors épreuve (tâche seule, document
 * seul). Il n'y a pas d'en-tête de page dans ce contexte.
 * = 1056 - (76 × 2) = 904 px.
 *
 * Écart volontaire de 1 px avec `MAX_CONTENT_HEIGHT_PX` de la pagination
 * épreuve (825 = 1056 - 151 - 80, avec `PAGE_MARGIN_PX = 151` qui sous-estime
 * les marges d'1 px). On ne modifie pas `PAGE_MARGIN_PX` ici pour ne pas
 * perturber la pagination existante ; on force la précision localement.
 */
export const HAUTEUR_UTILE_HORS_EPREUVE_PX = PAGE_HEIGHT_LETTER_PX - MARGE_IMPRESSION_PX * 2;

// ---------------------------------------------------------------------------
// Seuils de span
// ---------------------------------------------------------------------------

/** Contenu textuel > ce seuil → le document passe en span 2 (pleine largeur). */
export const SEUIL_MOTS_SPAN2 = 150;

/** Image portrait avec ratio h/w > ce seuil → span 2. */
export const SEUIL_RATIO_IMAGE_SPAN2 = 1.3;

/** Titre > ce seuil en mots, combiné à un contenu conséquent, → span 2. */
export const SEUIL_MOTS_TITRE_SPAN2 = 12;

/**
 * Seuil minimum de contenu textuel pour qu'un titre long déclenche le span 2.
 * Un titre long avec peu de contenu ne justifie pas la pleine largeur.
 */
export const SEUIL_MOTS_CONTENU_POUR_TITRE_LONG = 80;

// ---------------------------------------------------------------------------
// Contraintes image par span
// ---------------------------------------------------------------------------

export const IMAGE_MAX_HEIGHT_SPAN1_PX = 200;
export const IMAGE_MAX_HEIGHT_SPAN2_PX = 220;

// ---------------------------------------------------------------------------
// Dimensions de cellule (calculées depuis la largeur utile Letter)
// ---------------------------------------------------------------------------

/** Largeur utile Letter portrait - marges latérales (2cm × 2 = 152 px). */
const LARGEUR_UTILE_PX = PAGE_WIDTH_LETTER_PX - MARGE_IMPRESSION_PX * 2;

/** Largeur d'une cellule span 1 (= demi-largeur utile moins la moitié du gap). */
export const CELLULE_SPAN1_LARGEUR_PX = Math.floor(
  (LARGEUR_UTILE_PX - DOSSIER_GAP_HORIZONTAL_PX) / 2,
);

/** Largeur d'une cellule span 2 (= largeur utile entière). */
export const CELLULE_SPAN2_LARGEUR_PX = LARGEUR_UTILE_PX;

// ---------------------------------------------------------------------------
// Heuristique d'estimation de hauteur
// ---------------------------------------------------------------------------

/** Nombre de mots par ligne estimé à 12pt dans une cellule span 1 (~305 px contenu). */
export const MOTS_PAR_LIGNE_SPAN1 = 10;

/** Nombre de mots par ligne estimé à 12pt dans une cellule span 2 (~644 px contenu). */
export const MOTS_PAR_LIGNE_SPAN2 = 20;

/** Hauteur d'une ligne de texte Arial 12pt × 1.5 line-height. */
export const HAUTEUR_LIGNE_TEXTE_PX = 18;

/** Hauteur estimée de la ligne titre (numéro + titre) si présente. */
export const HAUTEUR_TITRE_PX = 25;

/** Hauteur estimée de la ligne source (hors cadre, sous la cellule). */
export const HAUTEUR_SOURCE_PX = 18;

/** Hauteur cumulée padding + auteur + marges pour document textuel. */
export const SURCHARGE_TEXTUEL_PX = 44;

/** Hauteur cumulée padding + marges pour document iconographique. */
export const SURCHARGE_ICONOGRAPHIQUE_PX = 16;
