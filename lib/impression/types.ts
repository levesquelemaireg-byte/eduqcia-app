/**
 * Types partagés du pipeline d'impression unifié.
 *
 * `RenduImprimable` est le type de sortie unique pour les 3 entités :
 * tâche seule, document seul, épreuve.
 *
 * Spec : docs/specs/spec-impression-tache-seule.md §4.
 */

import type { EnTeteEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression, Page, ErreurDebordement } from "@/lib/epreuve/pagination/types";

/* -------------------------------------------------------------------------- */
/*  Contexte d'impression                                                     */
/* -------------------------------------------------------------------------- */

export type ContexteImpression =
  | { type: "document" }
  | { type: "tache"; mode: ModeImpression; estCorrige: boolean }
  | { type: "epreuve"; mode: ModeImpression; estCorrige: boolean };

/* -------------------------------------------------------------------------- */
/*  Rendu imprimable — type de sortie unifié                                  */
/* -------------------------------------------------------------------------- */

export type RenduImprimable =
  | {
      ok: true;
      empreinte: string;
      contexte: ContexteImpression;
      enTete: EnTeteEpreuve | null;
      pages: Page[];
    }
  | {
      ok: false;
      erreur: ErreurDebordement;
    };
