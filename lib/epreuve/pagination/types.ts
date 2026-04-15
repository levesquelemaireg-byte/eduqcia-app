/**
 * Types de pagination PDF — print-engine v2.1 §4.3.
 */

import type { EnTeteEpreuve } from "@/lib/epreuve/contrats/donnees";

/* -------------------------------------------------------------------------- */
/*  Modes et feuillets                                                        */
/* -------------------------------------------------------------------------- */

export type ModeImpression = "formatif" | "sommatif-standard" | "epreuve-ministerielle";
export type TypeFeuillet = "dossier-documentaire" | "questionnaire" | "cahier-reponses";

/* -------------------------------------------------------------------------- */
/*  Blocs                                                                     */
/* -------------------------------------------------------------------------- */

export type KindBloc = "document" | "quadruplet" | "entete-section";

export type Bloc = {
  id: string;
  kind: KindBloc;
  tacheId?: string;
  content: unknown;
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

export type EpreuvePaginee =
  | {
      ok: true;
      empreinte: string;
      enTete: EnTeteEpreuve;
      feuillets: Record<TypeFeuillet, Page[]>;
    }
  | {
      ok: false;
      erreur: ErreurDebordement;
    };
