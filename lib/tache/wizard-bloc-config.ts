/**
 * Registre central de configuration des blocs wizard par comportement attendu.
 *
 * Deux dimensions indépendantes :
 *   Bloc 3 (consigne) : libre | modele_souple | structure | pur
 *   Bloc 4 (documents) : standard | perspectives (count: 2|3)
 *   Bloc 5 (corrigé)  : standard | intrus
 *
 * Ajouter un nouveau comportement  = 1 entrée ici.
 * Ajouter un nouveau pattern       = 1 composant générique réutilisable.
 * Jamais un composant one-shot par comportement.
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md
 */

import type { ConsigneTemplateKey } from "@/lib/tache/consigne-templates";
import type { Bloc3Type, Bloc4Type, Bloc5Type } from "@/lib/tache/parcours/types";

// ---------------------------------------------------------------------------
// Types de configuration par bloc
// ---------------------------------------------------------------------------

export type Bloc3Config =
  | { type: Extract<Bloc3Type, "modele_souple">; templateKey: ConsigneTemplateKey }
  | { type: Extract<Bloc3Type, "structure">; variante: "compare" | "triple" }
  | { type: Extract<Bloc3Type, "pur">; variante: "triple" | "oi6" | "oi7" };

export type Bloc4Config =
  | { type: Extract<Bloc4Type, "standard"> }
  | { type: Extract<Bloc4Type, "perspectives">; count: 2 | 3; modeGroupeDefaut: boolean }
  | { type: Extract<Bloc4Type, "moments">; count: 2; modeGroupeDefaut: boolean };

export type Bloc5Config =
  | { type: Extract<Bloc5Type, "standard"> }
  | { type: Extract<Bloc5Type, "intrus">; perspectiveCount: 3 }
  | { type: Extract<Bloc5Type, "redactionnel">; templateKey: string };

export type WizardBlocConfig = {
  bloc3: Bloc3Config;
  bloc4: Bloc4Config;
  bloc5?: Bloc5Config;
};

// ---------------------------------------------------------------------------
// Registre par comportement_id
// ---------------------------------------------------------------------------

export const WIZARD_BLOC_CONFIGS: Record<string, WizardBlocConfig> = {
  // OI0 · 0.1 — consigne libre : pas d'entrée ici (fallback Bloc3ConsigneProduction + Bloc4 standard)

  // OI3 — différence / similitude (1 document)
  "3.1": {
    bloc3: { type: "modele_souple", templateKey: "oi3-difference" },
    bloc4: { type: "standard" },
  },
  "3.2": {
    bloc3: { type: "modele_souple", templateKey: "oi3-similitude" },
    bloc4: { type: "standard" },
  },

  // OI3 — désaccord / accord (2 perspectives)
  "3.3": {
    bloc3: { type: "structure", variante: "compare" },
    bloc4: { type: "perspectives", count: 2, modeGroupeDefaut: true },
    bloc5: { type: "redactionnel", templateKey: "accord-desaccord" },
  },
  "3.4": {
    bloc3: { type: "structure", variante: "compare" },
    bloc4: { type: "perspectives", count: 2, modeGroupeDefaut: true },
    bloc5: { type: "redactionnel", templateKey: "accord-desaccord" },
  },

  // OI3 — différences et similitudes (3 perspectives)
  "3.5": {
    bloc3: { type: "pur", variante: "triple" },
    bloc4: { type: "perspectives", count: 3, modeGroupeDefaut: true },
    bloc5: { type: "intrus", perspectiveCount: 3 },
  },

  // OI4 — cause / conséquence
  "4.1": {
    bloc3: { type: "modele_souple", templateKey: "oi4-cause" },
    bloc4: { type: "standard" },
  },
  "4.2": {
    bloc3: { type: "modele_souple", templateKey: "oi4-consequence" },
    bloc4: { type: "standard" },
  },

  // OI6 — changements et continuités (6.1/6.2 : 1 document standard)
  "6.1": {
    bloc3: { type: "modele_souple", templateKey: "oi6-changement" },
    bloc4: { type: "standard" },
  },
  "6.2": {
    bloc3: { type: "modele_souple", templateKey: "oi6-continuite" },
    bloc4: { type: "standard" },
  },

  // OI6 — changement OU continuité (template pur)
  "6.3": {
    bloc3: { type: "pur", variante: "oi6" },
    bloc4: { type: "moments", count: 2, modeGroupeDefaut: true },
    bloc5: { type: "redactionnel", templateKey: "changement-continuite" },
  },

  // OI7 — liens de causalité
  "7.1": {
    bloc3: { type: "pur", variante: "oi7" },
    bloc4: { type: "standard" },
    bloc5: { type: "redactionnel", templateKey: "causalite" },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retourne la config du comportement, ou `undefined` si aucun mapping n'existe (→ fallback libre). */
export function getWizardBlocConfig(comportementId: string): WizardBlocConfig | undefined {
  return WIZARD_BLOC_CONFIGS[comportementId];
}
