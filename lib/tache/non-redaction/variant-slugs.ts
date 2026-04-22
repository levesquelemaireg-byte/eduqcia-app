/**
 * Slugs dossiers `components/tache/non-redaction/<slug>/` — alignés sur la spec et `public/data/oi.json`.
 */

export const TACHE_NON_REDACTION_VARIANT_SLUGS = [
  "ordre-chronologique",
  "ligne-du-temps",
  "avant-apres",
  "carte-historique",
  "manifestations",
  "causes-consequences",
] as const;

export type TacheNonRedactionVariantSlug = (typeof TACHE_NON_REDACTION_VARIANT_SLUGS)[number];

const SLUG_SET = new Set<string>(TACHE_NON_REDACTION_VARIANT_SLUGS);

export function isTacheNonRedactionVariantSlug(
  value: string,
): value is TacheNonRedactionVariantSlug {
  return SLUG_SET.has(value);
}
