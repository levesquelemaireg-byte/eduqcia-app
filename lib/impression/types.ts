/**
 * Types partagés du pipeline d'impression unifié.
 *
 * `RenduImprimable` est le type de sortie unique pour les 3 entités :
 * tâche seule, document seul, épreuve.
 *
 * Spec : docs/specs/fermees/spec-impression-tache-seule.md §4.
 */

import type { EnTeteEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression, Page, ErreurDebordement } from "@/lib/epreuve/pagination/types";

/* -------------------------------------------------------------------------- */
/*  Mode corrigé (spec §3.5, §7.5)                                            */
/* -------------------------------------------------------------------------- */

/**
 * Mode de rendu du corrigé.
 *
 * - `null` : pas de corrigé (version élève pure)
 * - `"simple"` : overlay rouge sur la version élève (bonne réponse en
 *   rouge dans la case réponse / sur les lignes vierges). Même layout,
 *   empilable pixel-perfect sur la feuille élève (spec §7.5).
 * - `"detaille"` : corrigé simple + page annexe « Notes du correcteur »
 *   en fin de document, avec justifications et notes par question.
 */
export type ModeCorrige = "simple" | "detaille" | null;

/* -------------------------------------------------------------------------- */
/*  Contexte d'impression                                                     */
/* -------------------------------------------------------------------------- */

export type ContexteImpression =
  | { type: "document" }
  | { type: "tache"; mode: ModeImpression; corrige: ModeCorrige }
  | { type: "epreuve"; mode: ModeImpression; corrige: ModeCorrige };

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
