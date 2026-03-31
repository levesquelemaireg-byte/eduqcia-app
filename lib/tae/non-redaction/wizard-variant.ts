import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";

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

/** Sommaire wizard : pas de pastille « aspects » pour les parcours à consigne ministérielle structurée. */
export function isActiveNonRedactionSommaireHideAspectsVariant(state: TaeFormState): boolean {
  return isActiveOrdreChronologiqueVariant(state) || isActiveLigneDuTempsVariant(state);
}
