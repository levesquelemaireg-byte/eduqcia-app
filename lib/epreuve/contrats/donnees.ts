/**
 * Contrat de données épreuve — print-engine v2.1 §4.2.
 */

import type { DonneesTache } from "@/lib/tache/contrats/donnees";

/** En-tête répété sur chaque page du PDF, injecté par `SectionPage`. */
export type EnTeteEpreuve = {
  titre: string;
  enseignant: string;
  ecole?: string;
  niveau?: string;
  groupe?: string;
  date?: string;
};

/** Données complètes d'une épreuve pour la chaîne d'impression. */
export type DonneesEpreuve = {
  id: string;
  titre: string;
  enTete: EnTeteEpreuve;
  taches: DonneesTache[];
};
