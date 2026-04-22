import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import type { ComportementSlug } from "@/lib/tache/behaviours/types";

/**
 * Résout le slug behaviour-driven à partir du `comportement_id` (`oi.json`).
 * Absence de `variant_slug` ⇒ parcours rédactionnel.
 */
export function resolveComportementSlug(comportementId: string): ComportementSlug {
  if (!comportementId.trim()) return "redactionnel";
  const v = getVariantSlugForComportementId(comportementId);
  if (v === "ordre-chronologique" || v === "ligne-du-temps" || v === "avant-apres") {
    return v;
  }
  return "redactionnel";
}
