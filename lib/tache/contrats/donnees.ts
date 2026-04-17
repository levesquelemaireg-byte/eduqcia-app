/**
 * Contrat de données pivot — type unique `DonneesTache`.
 * Remplace le legacy `TaeFicheData` pour la chaîne d'impression (print-engine v2.1 §4.1).
 *
 * Le print-engine consomme un sous-ensemble via `Pick<DonneesTache, ...>` local.
 * Les selectors de `lib/fiche/selectors/` restent pour le sommaire wizard.
 */

import type { CdSelection, ConnaissanceSelection } from "@/lib/types/fiche";
import type { RendererDocument } from "@/lib/types/document-renderer";

/* -------------------------------------------------------------------------- */
/*  Sous-types structurés                                                     */
/* -------------------------------------------------------------------------- */

/** Guidage structuré — remplace la string monolithique avec ancres HTML. */
export type Guidage = { content: string } | null;

/** Descripteur d'un niveau de performance dans un critère d'évaluation. */
export type Descripteur = {
  niveau: string;
  description: string;
  points: number;
};

/** Critère d'évaluation avec ses descripteurs par niveau. */
export type Critere = {
  libelle: string;
  descripteurs: Descripteur[];
};

/** Outil d'évaluation résolu depuis `grilles-evaluation.json`. */
export type OutilEvaluation = {
  oi: "OI0" | "OI1" | "OI2" | "OI3" | "OI4" | "OI5" | "OI6" | "OI7" | "redactionnel";
  criteres: Critere[];
};

/** Espace de production — zone où l'élève produit sa réponse. */
export type EspaceProduction =
  | { type: "lignes"; nbLignes: number }
  | { type: "cases"; options: string[] }
  | { type: "libre" };

/* -------------------------------------------------------------------------- */
/*  Type pivot unique                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Type pivot unique pour toutes les données d'une tâche.
 * Contient les données métier ET les données structurées pour l'impression.
 *
 * Champs métier issus de `TaeFicheData` (inchangés sémantiquement).
 * Champs impression structurés (guidage, espaceProduction, outilEvaluation).
 */
export type DonneesTache = {
  /* --- Identité --- */
  id: string;
  auteur_id: string;
  auteurs: { id: string; first_name: string; last_name: string }[];

  /* --- Contenu structuré (impression) --- */
  titre: string;
  consigne: string;
  guidage: Guidage;
  documents: RendererDocument[];
  espaceProduction: EspaceProduction;
  outilEvaluation: OutilEvaluation;
  corrige: string;

  /* --- Métadonnées métier --- */
  aspects_societe: string[];
  nb_lignes: number;
  niveau: { label: string };
  discipline: { label: string };
  oi: { id: string; titre: string; icone: string };
  comportement: { id: string; enonce: string };
  cd: CdSelection | null;
  connaissances: ConnaissanceSelection[];

  /* --- Cycle de vie --- */
  version: number;
  version_updated_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
