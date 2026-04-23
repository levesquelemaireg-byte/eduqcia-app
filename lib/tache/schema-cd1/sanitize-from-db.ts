import { SCHEMA_CD1_INITIAL, type SchemaCd1Data } from "./types";

function sanitizeCase(raw: unknown): { guidage: string; reponse: string } {
  if (!raw || typeof raw !== "object") return { guidage: "", reponse: "" };
  const o = raw as Record<string, unknown>;
  return {
    guidage: typeof o.guidage === "string" ? o.guidage : "",
    reponse: typeof o.reponse === "string" ? o.reponse : "",
  };
}

function sanitizeBloc(raw: unknown) {
  if (!raw || typeof raw !== "object") {
    return {
      pivot: { guidage: "", reponse: "" },
      precision1: { guidage: "", reponse: "" },
      precision2: { guidage: "", reponse: "" },
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    pivot: sanitizeCase(o.pivot),
    precision1: sanitizeCase(o.precision1),
    precision2: sanitizeCase(o.precision2),
  };
}

/**
 * Valide et remplit les champs manquants d'un blob `schema_cd1_data` venant de la DB.
 * Retourne `null` uniquement si la donnée est absente ; retourne une structure minimale
 * si les champs sont partiels.
 */
export function sanitizeSchemaCd1FromDb(raw: unknown): SchemaCd1Data | null {
  if (raw === null || raw === undefined) return { ...SCHEMA_CD1_INITIAL };
  if (typeof raw !== "object") return { ...SCHEMA_CD1_INITIAL };
  const o = raw as Record<string, unknown>;
  return {
    preambule: typeof o.preambule === "string" ? o.preambule : "",
    chapeauObjet: typeof o.chapeauObjet === "string" ? o.chapeauObjet : "",
    chapeauPeriode: typeof o.chapeauPeriode === "string" ? o.chapeauPeriode : "",
    caseObjet: sanitizeCase(o.caseObjet),
    blocA: sanitizeBloc(o.blocA),
    blocB: sanitizeBloc(o.blocB),
  };
}
