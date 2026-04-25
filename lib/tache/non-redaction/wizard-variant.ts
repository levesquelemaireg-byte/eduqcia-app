import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

/** Tout comportement déclaré `variant_slug` dans `oi.json` (parcours non rédactionnel). */
export function isActiveNonRedactionVariant(state: TacheFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) !== null;
}

export function isActiveOrdreChronologiqueVariant(state: TacheFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "ordre-chronologique";
}

export function isActiveLigneDuTempsVariant(state: TacheFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "ligne-du-temps";
}

export function isActiveAvantApresVariant(state: TacheFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "avant-apres";
}

export function isActiveCarteHistoriqueVariant(state: TacheFormState): boolean {
  return getVariantSlugForComportementId(state.bloc2.comportementId) === "carte-historique";
}
