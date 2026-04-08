/**
 * Réhydratation `bloc5.nonRedaction` depuis `tae.non_redaction_data` à l’édition.
 */

import { initialAvantApresPayload } from "@/lib/tae/non-redaction/avant-apres-payload";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import { parseNonRedactionData } from "@/lib/tae/tae-form-hydrate";
import type { NonRedactionData } from "@/lib/tae/tae-form-state-types";

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
