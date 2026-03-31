import type { ComponentType } from "react";
import { Bloc3LigneDuTemps } from "@/components/tae/non-redaction/ligne-du-temps/Bloc3LigneDuTemps";
import { Bloc4LigneDuTemps } from "@/components/tae/non-redaction/ligne-du-temps/Bloc4LigneDuTemps";
import { Bloc3OrdreChronologique } from "@/components/tae/non-redaction/ordre-chronologique/Bloc3OrdreChronologique";
import { Bloc4OrdreChronologique } from "@/components/tae/non-redaction/ordre-chronologique/Bloc4OrdreChronologique";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import type { TaeNonRedactionVariantSlug } from "@/lib/tae/non-redaction/variant-slugs";
import {
  TAE_DOCUMENTS_STEP_INDEX,
  TAE_REDACTION_STEP_INDEX,
  type TaeFormState,
} from "@/lib/tae/tae-form-state-types";

type VariantBlocPair = {
  Bloc3: ComponentType;
  Bloc4: ComponentType;
};

/**
 * Paires Bloc3 / Bloc4 par slug — à remplir lorsque l’UI variante est livrée.
 * Tant qu’une entrée manque, le wizard conserve les blocs rédactionnels par défaut.
 */
export const TAE_NON_REDACTION_WIZARD_BLOCS: Partial<
  Record<TaeNonRedactionVariantSlug, VariantBlocPair>
> = {
  "ordre-chronologique": {
    Bloc3: Bloc3OrdreChronologique,
    Bloc4: Bloc4OrdreChronologique,
  },
  "ligne-du-temps": {
    Bloc3: Bloc3LigneDuTemps,
    Bloc4: Bloc4LigneDuTemps,
  },
};

/**
 * Composant d’étape pour les **étapes 3 et 4 du wizard** uniquement
 * (`currentStep === 2` ou `3`), si une variante enregistrée correspond au comportement.
 */
export function resolveWizardBlocComponent(
  stepIndex: number,
  state: TaeFormState,
): ComponentType | null {
  if (stepIndex !== TAE_REDACTION_STEP_INDEX && stepIndex !== TAE_DOCUMENTS_STEP_INDEX) {
    return null;
  }
  const slug = getVariantSlugForComportementId(state.bloc2.comportementId);
  if (!slug) return null;
  const pair = TAE_NON_REDACTION_WIZARD_BLOCS[slug];
  if (!pair) return null;
  return stepIndex === TAE_REDACTION_STEP_INDEX ? pair.Bloc3 : pair.Bloc4;
}
