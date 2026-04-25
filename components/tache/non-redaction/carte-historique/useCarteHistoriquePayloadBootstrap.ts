"use client";

import { useLayoutEffect } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import {
  initialCarteHistoriquePayload,
  isCarteHistoriqueComportementId,
  normalizeCarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { nonRedactionCartePayload } from "@/lib/tache/wizard-state-nr";

/**
 * Réinitialise un payload illisible (brouillon corrompu / changement de comportement).
 * Aligne `payload.comportementId` avec `bloc2.comportementId` quand l'enseignant change
 * de comportement (2.1 → 2.2 → 2.3) ; ce changement passe normalement par
 * `SET_COMPORTEMENT` qui réinitialise le payload, mais le hook agit en filet de sécurité.
 */
export function useCarteHistoriquePayloadBootstrap(): void {
  const { state, dispatch } = useTacheForm();
  const comportementId = state.bloc2.comportementId;

  useLayoutEffect(() => {
    if (getVariantSlugForComportementId(comportementId) !== "carte-historique") return;
    if (!isCarteHistoriqueComportementId(comportementId)) return;
    const raw = nonRedactionCartePayload(state);
    const n = normalizeCarteHistoriquePayload(raw);
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_CARTE_HISTORIQUE",
        patch: initialCarteHistoriquePayload(comportementId),
      });
      return;
    }
    if (n.comportementId !== comportementId) {
      dispatch({
        type: "NON_REDACTION_PATCH_CARTE_HISTORIQUE",
        patch: { ...initialCarteHistoriquePayload(comportementId) },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on observe le slug + le payload, pas tout l'état
  }, [dispatch, comportementId, state.bloc5.nonRedaction]);
}
