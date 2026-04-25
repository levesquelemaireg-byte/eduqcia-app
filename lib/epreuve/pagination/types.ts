/**
 * Types de pagination PDF — print-engine v2.1 §4.3.
 */

import type { RenduImprimable } from "@/lib/impression/types";

/* -------------------------------------------------------------------------- */
/*  Modes et feuillets                                                        */
/* -------------------------------------------------------------------------- */

export type ModeImpression = "formatif" | "sommatif-standard" | "epreuve-ministerielle";
export type TypeFeuillet = "dossier-documentaire" | "questionnaire" | "cahier-reponses";

/* -------------------------------------------------------------------------- */
/*  Blocs                                                                     */
/* -------------------------------------------------------------------------- */

export type KindBloc = "dossier-page" | "quadruplet" | "entete-section";

/**
 * Contrat de pagination explicite.
 *
 * - `flow` (défaut implicite si `pagination` absent) : le bloc s'empile
 *   normalement avec les autres jusqu'à `MAX_CONTENT_HEIGHT_PX`.
 * - `exclusive-page` : le bloc force une page dédiée (pas d'empilage avant
 *   ou après lui sur la même page physique). Utilisé pour les pages du
 *   dossier documentaire (1 grille = 1 page), et potentiellement pour des
 *   pages de garde, couvertures, etc.
 */
export type PaginationMode = "flow" | "exclusive-page";

export type Bloc = {
  id: string;
  kind: KindBloc;
  tacheId?: string;
  content: unknown;
  /** Contrat de pagination (défaut : `{ mode: "flow" }`). */
  pagination?: { mode: PaginationMode };
};

export type BlocMesure = Bloc & {
  hauteurPx: number;
  ratio: number;
  securise: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Pages                                                                     */
/* -------------------------------------------------------------------------- */

export type Page = {
  feuillet: TypeFeuillet;
  numeroPage: number;
  totalPages: number;
  blocs: BlocMesure[];
  hauteurTotalePx: number;
};

/* -------------------------------------------------------------------------- */
/*  Erreur de débordement                                                     */
/* -------------------------------------------------------------------------- */

export type ErreurDebordement = {
  kind: "DEBORDEMENT_BLOC";
  blocId: string;
  blocLibelle: string;
  hauteurPx: number;
  hauteurMaxPx: number;
  suggestion: string;
};

/* -------------------------------------------------------------------------- */
/*  Résultat paginé                                                           */
/* -------------------------------------------------------------------------- */

/**
 * @deprecated Utiliser `RenduImprimable` de `@/lib/impression/types`.
 * Alias conservé pour la rétrocompatibilité.
 */
export type EpreuvePaginee = RenduImprimable;
