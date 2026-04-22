/**
 * Réhydratation `bloc5.nonRedaction` depuis `tache.non_redaction_data` à l’édition.
 */

import { initialAvantApresPayload } from "@/lib/tache/non-redaction/avant-apres-payload";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { parseNonRedactionData } from "@/lib/tache/tache-form-hydrate";
import type { NonRedactionData } from "@/lib/tache/tache-form-state-types";

export function nonRedactionFromDbColumn(
  comportementId: string,
  columnJson: unknown,
): NonRedactionData | null {
  const slug = getVariantSlugForComportementId(comportementId);
  const parsed = parseNonRedactionData(columnJson);
  if (slug === "avant-apres") {
    if (parsed?.type === "avant-apres") return parsed;
    return { type: "avant-apres", payload: initialAvantApresPayload() };
  }
  return parsed;
}
