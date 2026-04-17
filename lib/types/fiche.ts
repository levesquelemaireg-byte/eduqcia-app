/** FICHE-TACHE.md — données affichées par `FicheTache` et `TaeCard`. */

import type { DocumentLegendPosition } from "@/lib/tae/document-helpers";
import type { RendererDocument } from "@/lib/types/document-renderer";

export type AspectSociete = "economique" | "politique" | "social" | "culturel" | "territorial";

export type DocumentFiche = {
  letter: "A" | "B" | "C" | "D";
  titre: string;
  contenu: string;
  source_citation: string;
  type: "textuel" | "iconographique";
  image_url: string | null;
  /** Largeur / hauteur pixel (ex. après téléversement) ; null si inconnu (fiche publiée, réutilisation). */
  imagePixelWidth: number | null;
  imagePixelHeight: number | null;
  /** Facteur 0,5–1 pour l’iconographique sur la fiche imprimable ; textuel ignoré au rendu. */
  printImpressionScale: number;
  /** Texte sur l’image (overlay) ; `null` si pas de légende. */
  imageLegende: string | null;
  /** Coin du bandeau ; `null` si pas de légende ou données incomplètes. */
  imageLegendePosition: DocumentLegendPosition | null;
  /**
   * Document hydraté sous forme canonique.
   * Toujours présent pour les données serveur (via `hydrateRendererDocument`).
   * Pour les données wizard, utiliser `documentFicheVersRenderer` si absent.
   */
  rendererDocument?: RendererDocument;
  /** Type de source — primaire ou secondaire. */
  sourceType?: "primaire" | "secondaire";
  /** Repère temporel (texte libre) — ex. "1837", "1760-1867". */
  repereTemporel?: string | null;
  /** Libellé de la catégorie (textuelle ou iconographique) — pré-calculé pour affichage. */
  categorieLabel?: string | null;
};

export type CdSelection = {
  competence: string;
  composante: string;
  critere: string;
};

/** HQC : `sous_section` toujours null — 3 niveaux max. HEC : peut être renseigné. */
export type ConnaissanceSelection = {
  realite_sociale: string;
  section: string;
  sous_section: string | null;
  enonce: string;
};

export type TaeFicheData = {
  id: string;
  auteur_id: string;
  auteurs: { id: string; first_name: string; last_name: string }[];
  consigne: string;
  guidage: string;
  corrige: string;
  aspects_societe: string[];
  nb_lignes: number;
  niveau: { label: string };
  discipline: { label: string };
  oi: { id: string; titre: string; icone: string };
  comportement: { id: string; enonce: string };
  /** Id grille dans `grilles-evaluation.json` — même source que le Bloc 2. */
  outilEvaluation: string | null;
  cd: CdSelection | null;
  connaissances: ConnaissanceSelection[];
  documents: DocumentFiche[];
  version: number;
  version_updated_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  /**
   * Parcours non rédactionnel (`variant_slug` dans `oi.json`) : pas de réponse sur lignes ;
   * masquer le compteur « N lignes » (pied fiche) et les lignes vides à l’impression.
   * Absent ou `true` : comportement rédactionnel habituel.
   */
  showStudentAnswerLines?: boolean;
  /**
   * Feuilles **élève** (aperçu impression TAÉ, questionnaire épreuve) : si `false`, la section guidage
   * n’est pas rendue (ex. évaluation **sommative** — le guidage reste affiché sur la fiche lecture enseignant).
   * Absent ou `true` : afficher le guidage lorsqu’il a du contenu textuel.
   */
  showGuidageOnStudentSheet?: boolean;
};

/** docs/FEATURES.md §8.3 — nombres bruts par niveau (pas de moyenne publique). */
export type PeerVoteTally = {
  rigueur_n1: number;
  rigueur_n2: number;
  rigueur_n3: number;
  clarte_n1: number;
  clarte_n2: number;
  clarte_n3: number;
  alignement_n1: number;
  alignement_n2: number;
  alignement_n3: number;
  total_votants: number;
};
