import type { ParcoursId, ParcoursTache } from "./types";
import { PARCOURS_SECTION_A } from "./section-a";
import { PARCOURS_SECTION_B_SCHEMA_CD1 } from "./section-b-schema-cd1";
import { PARCOURS_SECTION_C_INTERPRETATION_CD2 } from "./section-c-interpretation-cd2";

const PARCOURS_MAP: ReadonlyMap<ParcoursId, ParcoursTache> = new Map([
  ["section-a", PARCOURS_SECTION_A],
  ["section-b-schema-cd1", PARCOURS_SECTION_B_SCHEMA_CD1],
  ["section-c-interpretation-cd2", PARCOURS_SECTION_C_INTERPRETATION_CD2],
]);

export function obtenirParcours(id: ParcoursId): ParcoursTache {
  const parcours = PARCOURS_MAP.get(id);
  if (!parcours) throw new Error(`Parcours inconnu : ${id}`);
  return parcours;
}

export function tousLesParcours(): readonly ParcoursTache[] {
  return [...PARCOURS_MAP.values()];
}

/** Retourne uniquement les parcours activés dans l'UI. */
export function parcoursActifs(): readonly ParcoursTache[] {
  return [...PARCOURS_MAP.values()].filter((p) => p.actif);
}
