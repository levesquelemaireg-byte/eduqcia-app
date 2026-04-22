/**
 * Construction des entrées `documents_new` à partir du payload perspectives.
 *
 * Fonction unique pour tous les comportements à perspectives (count=2 ou count=3).
 * Pas de duplication selon le nombre de perspectives.
 *
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § Payload unifié — perspectives
 */

import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type {
  PerspectivesPayload,
  PerspectiveData,
} from "@/lib/tache/oi-perspectives/perspectives-types";

// ---------------------------------------------------------------------------
// Type de sortie — sous-ensemble de PublishTaeRpcPayload["documents_new"][number]
// ---------------------------------------------------------------------------

export type PerspectiveDocumentNew = {
  titre: string;
  type: "textuel" | "iconographique";
  contenu: string | null;
  image_url: null;
  source_citation: string;
  is_published: boolean;
};

export type PerspectiveSlotMapping = {
  slot: DocumentSlotId;
  ordre: number;
  mode: "create";
  newIndex: number;
};

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Génère les entrées `documents_new` et les `slots` pour le payload RPC
 * à partir d'un `PerspectivesPayload`.
 *
 * - Mode groupé : chaque perspective devient un document composite non publié
 *   (non réutilisable dans la banque).
 * - Mode séparé : chaque perspective devient un document indépendant publié.
 */
export function buildPerspectivesDocumentsNew(
  payload: PerspectivesPayload,
  slots: DocumentSlotId[],
): { documentsNew: PerspectiveDocumentNew[]; slotMappings: PerspectiveSlotMapping[] } {
  if (slots.length !== payload.perspectives.length) {
    throw new Error(
      `Nombre de slots (${slots.length}) ≠ nombre de perspectives (${payload.perspectives.length}).`,
    );
  }

  const isGrouped = payload.mode === "groupe";

  const documentsNew: PerspectiveDocumentNew[] = payload.perspectives.map(
    (p: PerspectiveData, i: number) => ({
      titre: isGrouped ? payload.titre : perspectiveStandaloneTitle(payload.titre, i),
      type: p.type,
      contenu: p.contenu || null,
      image_url: null,
      source_citation: p.source,
      is_published: !isGrouped,
    }),
  );

  const slotMappings: PerspectiveSlotMapping[] = slots.map((slot, i) => ({
    slot,
    ordre: i + 1,
    mode: "create" as const,
    newIndex: i,
  }));

  return { documentsNew, slotMappings };
}

// ---------------------------------------------------------------------------
// Helpers internes
// ---------------------------------------------------------------------------

function perspectiveStandaloneTitle(baseTitre: string, index: number): string {
  const letters = ["A", "B", "C"] as const;
  const suffix = letters[index] ?? String(index + 1);
  return baseTitre ? `${baseTitre} — Perspective ${suffix}` : `Perspective ${suffix}`;
}
