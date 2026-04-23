import type { CaseSchemaCd1, CleCase, SchemaCd1Data } from "./types";

/**
 * Immuablement patcher une des 7 cases du schéma en naviguant par clé canonique.
 * Ne modifie jamais l'objet d'entrée ; retourne un nouveau `SchemaCd1Data`.
 */
export function mettreAJourCase(
  data: SchemaCd1Data,
  cle: CleCase,
  champ: keyof CaseSchemaCd1,
  valeur: string,
): SchemaCd1Data {
  switch (cle) {
    case "objet":
      return { ...data, caseObjet: { ...data.caseObjet, [champ]: valeur } };
    case "blocA.pivot":
      return { ...data, blocA: { ...data.blocA, pivot: { ...data.blocA.pivot, [champ]: valeur } } };
    case "blocA.precision1":
      return {
        ...data,
        blocA: { ...data.blocA, precision1: { ...data.blocA.precision1, [champ]: valeur } },
      };
    case "blocA.precision2":
      return {
        ...data,
        blocA: { ...data.blocA, precision2: { ...data.blocA.precision2, [champ]: valeur } },
      };
    case "blocB.pivot":
      return { ...data, blocB: { ...data.blocB, pivot: { ...data.blocB.pivot, [champ]: valeur } } };
    case "blocB.precision1":
      return {
        ...data,
        blocB: { ...data.blocB, precision1: { ...data.blocB.precision1, [champ]: valeur } },
      };
    case "blocB.precision2":
      return {
        ...data,
        blocB: { ...data.blocB, precision2: { ...data.blocB.precision2, [champ]: valeur } },
      };
  }
}
