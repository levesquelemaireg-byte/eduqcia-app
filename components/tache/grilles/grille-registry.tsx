import type { ReactElement } from "react";
import type { GrilleEntry } from "@/components/tache/wizard/bloc2/types";
import { GenericEchelleGrid } from "@/components/tache/grilles/GenericEchelleGrid";
import { GrilleOI3SO5 } from "@/components/tache/grilles/GrilleOI3SO5";
import { GrilleOI6SO3 } from "@/components/tache/grilles/GrilleOI6SO3";
import { GrilleOI7SO1 } from "@/components/tache/grilles/GrilleOI7SO1";
import { GrilleCD1Schema } from "@/components/tache/grilles/cd1-schema";

/** Identifiants avec composant dédié (structure hors `bareme.echelle`). */
export const DEDICATED_GRILLES = ["OI3_SO5", "OI6_SO3", "OI7_SO1", "CD1_SCHEMA"] as const;
export type DedicatedGrilleId = (typeof DEDICATED_GRILLES)[number];

function isDedicatedGrilleId(id: string): id is DedicatedGrilleId {
  return (DEDICATED_GRILLES as readonly string[]).includes(id);
}

const dedicatedRenderers: Record<DedicatedGrilleId, (entry: GrilleEntry) => ReactElement> = {
  OI3_SO5: () => <GrilleOI3SO5 />,
  OI6_SO3: (entry) => <GrilleOI6SO3 note={entry.bareme.note} />,
  OI7_SO1: () => <GrilleOI7SO1 />,
  CD1_SCHEMA: () => <GrilleCD1Schema />,
};

/**
 * Registre injectif `grilleId →` rendu tableau.
 * Les ids listés dans `DEDICATED_GRILLES` doivent avoir une entrée dans `dedicatedRenderers` (exhaustivité TS).
 * Toute autre id → `GenericEchelleGrid` + `bareme.echelle`.
 */
export function renderGrilleNode(entry: GrilleEntry): ReactElement {
  if (isDedicatedGrilleId(entry.id)) {
    return dedicatedRenderers[entry.id](entry);
  }
  return <GenericEchelleGrid entry={entry} />;
}
