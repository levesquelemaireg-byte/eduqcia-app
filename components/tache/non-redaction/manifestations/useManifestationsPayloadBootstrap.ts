"use client";

import { useLayoutEffect } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import {
  initialManifestationsPayload,
  isManifestationsComportementId,
  normalizeManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { nonRedactionManifestationsPayload } from "@/lib/tache/wizard-state-nr";

/**
 * Réinitialise un payload illisible (brouillon corrompu / changement de comportement).
 * Aligne `payload.comportementId` avec `bloc2.comportementId` quand l'enseignant
 * change de comportement (5.1 ↔ 5.2). Le changement passe normalement par
 * `SET_COMPORTEMENT` qui réinitialise le payload, mais le hook agit en filet de
 * sécurité.
 */
export function useManifestationsPayloadBootstrap(): void {
  const { state, dispatch } = useTacheForm();
  const comportementId = state.bloc2.comportementId;

  useLayoutEffect(() => {
    if (getVariantSlugForComportementId(comportementId) !== "manifestations") return;
    if (!isManifestationsComportementId(comportementId)) return;
    const raw = nonRedactionManifestationsPayload(state);
    const n = normalizeManifestationsPayload(raw);
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_MANIFESTATIONS",
        patch: initialManifestationsPayload(comportementId),
      });
      return;
    }
    if (n.comportementId !== comportementId) {
      dispatch({
        type: "NON_REDACTION_PATCH_MANIFESTATIONS",
        patch: { ...initialManifestationsPayload(comportementId) },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on observe le slug + le payload, pas tout l'état
  }, [dispatch, comportementId, state.bloc5.nonRedaction]);
}
