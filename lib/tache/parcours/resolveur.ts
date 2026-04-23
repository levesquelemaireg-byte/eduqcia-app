import { assertNever } from "@/lib/tache/assert-never";
import { PARCOURS_SECTION_A } from "./section-a";
import { PARCOURS_SECTION_B_SCHEMA_CD1 } from "./section-b-schema-cd1";
import { PARCOURS_SECTION_C_INTERPRETATION_CD2 } from "./section-c-interpretation-cd2";
import type { ParcoursTache } from "./types";

export type TypeTache = "section_a" | "section_b" | "section_c";

/**
 * Résout le parcours actif. Fonction pure, idempotente.
 * Le parcoursId n'est jamais stocké — toujours calculé à la volée.
 */
export function resoudreParcours(typeTache: TypeTache): ParcoursTache {
  switch (typeTache) {
    case "section_a":
      return PARCOURS_SECTION_A;
    case "section_b":
      return PARCOURS_SECTION_B_SCHEMA_CD1;
    case "section_c":
      return PARCOURS_SECTION_C_INTERPRETATION_CD2;
    default:
      return assertNever(typeTache);
  }
}
