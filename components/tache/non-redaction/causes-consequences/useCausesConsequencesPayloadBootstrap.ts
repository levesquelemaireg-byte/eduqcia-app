"use client";

import { useLayoutEffect } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import {
  initialCausesConsequencesPayload,
  isCausesConsequencesComportementId,
  normalizeCausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { nonRedactionCausesConsequencesPayload } from "@/lib/tache/wizard-state-nr";

/**
 * Réinitialise un payload illisible (brouillon corrompu / changement de comportement).
 * Aligne `payload.comportementId` avec `bloc2.comportementId` quand l'enseignant
 * change de comportement (4.3 ↔ 4.4). Le changement passe normalement par
 * `SET_COMPORTEMENT` qui réinitialise le payload, mais le hook agit en filet de
 * sécurité.
 */
export function useCausesConsequencesPayloadBootstrap(): void {
  const { state, dispatch } = useTacheForm();
  const comportementId = state.bloc2.comportementId;

  useLayoutEffect(() => {
    if (getVariantSlugForComportementId(comportementId) !== "causes-consequences") return;
    if (!isCausesConsequencesComportementId(comportementId)) return;
    const raw = nonRedactionCausesConsequencesPayload(state);
    const n = normalizeCausesConsequencesPayload(raw);
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_CAUSES_CONSEQUENCES",
        patch: initialCausesConsequencesPayload(comportementId),
      });
      return;
    }
    if (n.comportementId !== comportementId) {
      dispatch({
        type: "NON_REDACTION_PATCH_CAUSES_CONSEQUENCES",
        patch: { ...initialCausesConsequencesPayload(comportementId) },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on observe le slug + le payload, pas tout l'état
  }, [dispatch, comportementId, state.bloc5.nonRedaction]);
}
