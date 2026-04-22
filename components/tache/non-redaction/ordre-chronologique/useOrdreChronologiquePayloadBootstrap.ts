"use client";

import { useLayoutEffect } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import {
  initialOrdreChronologiquePayload,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import { nonRedactionOrdrePayload } from "@/lib/tache/wizard-state-nr";

/**
 * Initialise / normalise `bloc5.nonRedaction` ordre chronologique.
 * À appeler depuis **chaque** écran du parcours qui lit ce payload (étapes 3 et 5) :
 * à l’étape 5 seul, le composant de l’étape 3 n’est pas monté.
 */
export function useOrdreChronologiquePayloadBootstrap(): void {
  const { state, dispatch } = useTacheForm();

  useLayoutEffect(() => {
    const n = normalizeOrdreChronologiquePayload(nonRedactionOrdrePayload(state));
    if (!n) {
      dispatch({
        type: "NON_REDACTION_PATCH_ORDRE_CHRONO",
        patch: initialOrdreChronologiquePayload(),
      });
      return;
    }
    const raw = nonRedactionOrdrePayload(state);
    if (raw && typeof raw === "object") {
      const ro = raw as Record<string, unknown>;
      const legacy =
        typeof ro.optionA === "string" ||
        typeof ro.optionB === "string" ||
        typeof ro.optionC === "string" ||
        typeof ro.optionD === "string";
      if (legacy) {
        dispatch({ type: "NON_REDACTION_PATCH_ORDRE_CHRONO", patch: n });
      }
    }
    // Intentionnel : on ne veut pas re-run sur tout `state`, uniquement sur le payload non-rédaction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.bloc5.nonRedaction]);
}
