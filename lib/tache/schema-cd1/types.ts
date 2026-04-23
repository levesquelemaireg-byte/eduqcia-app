/**
 * Types du schéma de caractérisation (Section B — parcours CD1).
 *
 * Structure portrait à 7 cases :
 *   - 1 case « Objet de la description » (colonne gauche)
 *   - 2 blocs « Mise en relation » (aspects A et B), chacun composé de :
 *       - 1 élément central (pivot)
 *       - 2 éléments de précision
 *
 * Chaque case contient un **énoncé de guidage** (visible par l'élève, consigne
 * directive) et une **réponse attendue** (visible uniquement par l'enseignant
 * correcteur). Les deux sont stockés côte à côte dans la même case.
 */

export type CaseSchemaCd1 = {
  /** Consigne directive lue par l'élève (« Nommez… », « Indiquez… »). */
  guidage: string;
  /** Réponse attendue pour le pointage maximal — corrigé enseignant. */
  reponse: string;
};

export type BlocMiseEnRelation = {
  pivot: CaseSchemaCd1;
  precision1: CaseSchemaCd1;
  precision2: CaseSchemaCd1;
};

export type SchemaCd1Data = {
  /** Mise en contexte rédigée en TipTap (HTML). */
  preambule: string;
  /** Objet d'étude dans la consigne de caractérisation. */
  chapeauObjet: string;
  /** Intervalle temporel dans la consigne de caractérisation. */
  chapeauPeriode: string;
  /** Case « Objet de la description » (colonne gauche). */
  caseObjet: CaseSchemaCd1;
  /** Bloc associé à l'aspect A. */
  blocA: BlocMiseEnRelation;
  /** Bloc associé à l'aspect B. */
  blocB: BlocMiseEnRelation;
};

/** Clé canonique d'une des 7 cases du schéma. */
export type CleCase =
  | "objet"
  | "blocA.pivot"
  | "blocA.precision1"
  | "blocA.precision2"
  | "blocB.pivot"
  | "blocB.precision1"
  | "blocB.precision2";

export const TOUTES_LES_CASES: readonly CleCase[] = [
  "objet",
  "blocA.pivot",
  "blocA.precision1",
  "blocA.precision2",
  "blocB.pivot",
  "blocB.precision1",
  "blocB.precision2",
] as const;

export const CASE_VIDE: CaseSchemaCd1 = { guidage: "", reponse: "" };

export const BLOC_VIDE: BlocMiseEnRelation = {
  pivot: { ...CASE_VIDE },
  precision1: { ...CASE_VIDE },
  precision2: { ...CASE_VIDE },
};

export const SCHEMA_CD1_INITIAL: SchemaCd1Data = {
  preambule: "",
  chapeauObjet: "",
  chapeauPeriode: "",
  caseObjet: { ...CASE_VIDE },
  blocA: {
    pivot: { ...CASE_VIDE },
    precision1: { ...CASE_VIDE },
    precision2: { ...CASE_VIDE },
  },
  blocB: {
    pivot: { ...CASE_VIDE },
    precision1: { ...CASE_VIDE },
    precision2: { ...CASE_VIDE },
  },
};

/** Tous les champs d'une case vide (guidage + réponse) sont des strings vides. */
export function caseEstVide(c: CaseSchemaCd1): boolean {
  return c.guidage.trim().length === 0 && c.reponse.trim().length === 0;
}

/** Les deux champs d'une case sont remplis. */
export function caseEstComplete(c: CaseSchemaCd1): boolean {
  return c.guidage.trim().length > 0 && c.reponse.trim().length > 0;
}

/** Un des deux champs est rempli, mais pas les deux. */
export function caseEstEnCours(c: CaseSchemaCd1): boolean {
  return !caseEstVide(c) && !caseEstComplete(c);
}

/** Accès en lecture par clé canonique. */
export function obtenirCase(data: SchemaCd1Data, cle: CleCase): CaseSchemaCd1 {
  switch (cle) {
    case "objet":
      return data.caseObjet;
    case "blocA.pivot":
      return data.blocA.pivot;
    case "blocA.precision1":
      return data.blocA.precision1;
    case "blocA.precision2":
      return data.blocA.precision2;
    case "blocB.pivot":
      return data.blocB.pivot;
    case "blocB.precision1":
      return data.blocB.precision1;
    case "blocB.precision2":
      return data.blocB.precision2;
  }
}

/** Compteur de cases complètes (guidage + réponse) sur un total fixe de 7. */
export function compterCasesCompletes(data: SchemaCd1Data): number {
  let n = 0;
  for (const cle of TOUTES_LES_CASES) {
    if (caseEstComplete(obtenirCase(data, cle))) n += 1;
  }
  return n;
}
