"use client";

import { useLayoutEffect } from "react";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import {
  initialAvantApresPayload,
  normalizeAvantApresPayload,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import { nonRedactionAvantApresPayload } from "@/lib/tae/wizard-state-nr";

/** Réinitialise un payload illisible (brouillon corrompu). */
export function useAvantApresPayloadBootstrap(): void {
  const { state, dispatch } = useTaeForm();

  useLayoutEffect(() => {
    if (getVariantSlugForComportementId(state.bloc2.comportementId) !== "avant-apres") return;
    const raw = nonRedactionAvantApresPayload(state);
    const n = normalizeAvantApresPayload(raw);
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_AVANT_APRES",
        patch: initialAvantApresPayload(),
      });
    }
    // Intentionnel : on ne veut pas re-run sur tout `state`, uniquement sur le comportement et le payload non-rédaction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.bloc2.comportementId, state.bloc5.nonRedaction]);
}
