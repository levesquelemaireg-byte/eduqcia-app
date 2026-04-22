/**
 * Slugs dossiers `components/tae/non-redaction/<slug>/` — alignés sur la spec et `public/data/oi.json`.
 */

export const TAE_NON_REDACTION_VARIANT_SLUGS = [
  "ordre-chronologique",
  "ligne-du-temps",
  "avant-apres",
  "carte-historique",
  "manifestations",
  "causes-consequences",
] as const;

export type TaeNonRedactionVariantSlug = (typeof TAE_NON_REDACTION_VARIANT_SLUGS)[number];

const SLUG_SET = new Set<string>(TAE_NON_REDACTION_VARIANT_SLUGS);

export function isTaeNonRedactionVariantSlug(value: string): value is TaeNonRedactionVariantSlug {
  return SLUG_SET.has(value);
}
