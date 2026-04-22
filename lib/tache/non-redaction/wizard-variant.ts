import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import type { TaeFormState } from "@/lib/tache/tae-form-state-types";

/** Tout comportement déclaré `variant_slug` dans `oi.json` (parcours non rédactionnel). */
export function isActiveNonRedactionVariant(state: TaeFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) !== null;
}

export function isActiveOrdreChronologiqueVariant(state: TaeFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "ordre-chronologique";
}

export function isActiveLigneDuTempsVariant(state: TaeFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "ligne-du-temps";
}

export function isActiveAvantApresVariant(state: TaeFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "avant-apres";
}
