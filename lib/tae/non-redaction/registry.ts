/**
 * Registre parcours non rédactionnels — `comportement_id` → slug (depuis `oi.json`).
 * Pas de JSX ici (`docs/ARCHITECTURE.md`).
 */

import rawOi from "@/public/data/oi.json";
import type { OiEntryJson } from "@/lib/types/oi";
import {
  isTaeNonRedactionVariantSlug,
  type TaeNonRedactionVariantSlug,
} from "@/lib/tae/non-redaction/variant-slugs";

const oiList = rawOi as OiEntryJson[];

const comportementIdToVariantSlug = new Map<string, TaeNonRedactionVariantSlug>();

for (const oi of oiList) {
  for (const c of oi.comportements_attendus) {
    const raw = c.variant_slug;
    if (typeof raw === "string" && isTaeNonRedactionVariantSlug(raw)) {
      comportementIdToVariantSlug.set(c.id, raw);
    }
  }
}

/** Slug variante pour ce comportement, si déclaré et valide dans `oi.json`. */
export function getVariantSlugForComportementId(
  comportementId: string,
): TaeNonRedactionVariantSlug | null {
  if (!comportementId) return null;
  return comportementIdToVariantSlug.get(comportementId) ?? null;
}
