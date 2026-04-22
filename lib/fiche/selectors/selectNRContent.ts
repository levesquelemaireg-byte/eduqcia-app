/**
 * Selector mémoïsé — cascade NR exécutée une seule fois par render.
 * Consommé par selectConsigne, selectGuidage, selectCorrige.
 *
 * Priorité : avant/après → ordre chronologique → ligne du temps → null (rédactionnel).
 */

import { createSelector } from "@/lib/fiche/helpers";
import type { NonRedactionContent } from "@/lib/fiche/types";
import type { TaeFormState } from "@/lib/tache/tae-form-state-types";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
  normalizeAvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueCorrigeHtml,
  buildOrdreChronologiqueGuidageHtml,
  normalizeOrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsCorrigeHtml,
  buildLigneDuTempsGuidageHtml,
  normalizeLigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";

export const selectNRContent = createSelector(
  [
    (state: TaeFormState) => state.bloc2.comportementId,
    (state: TaeFormState) => state.bloc5.nonRedaction,
  ],
  (comportementId, nonRedaction): NonRedactionContent | null => {
    const slug = getVariantSlugForComportementId(comportementId);
    if (!slug || !nonRedaction || nonRedaction.type === "placeholder") return null;

    if (slug === "avant-apres" && nonRedaction.type === "avant-apres") {
      const norm = normalizeAvantApresPayload(nonRedaction.payload);
      if (!norm) return null;
      return {
        consigne: buildAvantApresConsigneHtml(norm),
        guidage: buildAvantApresGuidageHtml(),
        corrige: buildAvantApresCorrigeHtml(norm),
      };
    }

    if (slug === "ordre-chronologique" && nonRedaction.type === "ordre-chronologique") {
      const norm = normalizeOrdreChronologiquePayload(nonRedaction.payload);
      if (!norm) return null;
      return {
        consigne: buildOrdreChronologiqueConsigneHtml(norm),
        guidage: buildOrdreChronologiqueGuidageHtml(),
        corrige: buildOrdreChronologiqueCorrigeHtml(norm),
      };
    }

    if (slug === "ligne-du-temps" && nonRedaction.type === "ligne-du-temps") {
      const norm = normalizeLigneDuTempsPayload(nonRedaction.payload);
      if (!norm) return null;
      return {
        consigne: buildLigneDuTempsConsigneHtml(norm),
        guidage: buildLigneDuTempsGuidageHtml(),
        corrige: buildLigneDuTempsCorrigeHtml(norm),
      };
    }

    return null;
  },
);
