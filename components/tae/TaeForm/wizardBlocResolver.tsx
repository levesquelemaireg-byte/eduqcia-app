// Résolveur des variantes Bloc 3 et Bloc 4 selon le comportement attendu.
// Couvre uniquement les étapes 3 (rédaction/consigne) et 4 (documents).
// Le routage du Bloc 5 est dans bloc5/Bloc5.tsx, qui suit un pattern similaire
// mais opère sur un périmètre distinct (cas intrus, variantes NR, rédactionnel).
// Cette séparation est volontaire : chaque résolveur a une responsabilité unique
// sur un périmètre clair, conformément au principe de séparation des responsabilités.

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { Bloc3AvantApres } from "@/components/tae/non-redaction/avant-apres/Bloc3AvantApres";
import { Bloc4AvantApres } from "@/components/tae/non-redaction/avant-apres/Bloc4AvantApres";
import { Bloc3LigneDuTemps } from "@/components/tae/non-redaction/ligne-du-temps/Bloc3LigneDuTemps";
import { Bloc4LigneDuTemps } from "@/components/tae/non-redaction/ligne-du-temps/Bloc4LigneDuTemps";
import { Bloc3OrdreChronologique } from "@/components/tae/non-redaction/ordre-chronologique/Bloc3OrdreChronologique";
import { Bloc4OrdreChronologique } from "@/components/tae/non-redaction/ordre-chronologique/Bloc4OrdreChronologique";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";
import type { TaeNonRedactionVariantSlug } from "@/lib/tae/non-redaction/variant-slugs";
import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
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
  "avant-apres": {
    Bloc3: Bloc3AvantApres,
    Bloc4: Bloc4AvantApres,
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
  if (!slug) return resolvePerspectivesBlocComponent(stepIndex, state);
  const pair = TAE_NON_REDACTION_WIZARD_BLOCS[slug];
  if (!pair) return null;
  return stepIndex === TAE_REDACTION_STEP_INDEX ? pair.Bloc3 : pair.Bloc4;
}

// ---------------------------------------------------------------------------
// Perspectives OI3 — branchement par WizardBlocConfig (pas de variant_slug)
// ---------------------------------------------------------------------------

const Bloc3ModeleSouple = dynamic(
  () => import("@/components/tae/TaeForm/bloc3/templates/Bloc3ModeleSouple"),
  { ssr: false },
);
const Bloc3TemplateStructure = dynamic(
  () => import("@/components/tae/TaeForm/bloc3/templates/Bloc3TemplateStructure"),
  { ssr: false },
);
const Bloc3TemplatePur = dynamic(
  () => import("@/components/tae/TaeForm/bloc3/templates/Bloc3TemplatePur"),
  { ssr: false },
);
const Bloc4Perspectives = dynamic(
  () => import("@/components/tae/TaeForm/bloc4/Bloc4Perspectives"),
  { ssr: false },
);
const Bloc4Moments = dynamic(() => import("@/components/tae/TaeForm/bloc4/Bloc4Moments"), {
  ssr: false,
});

function resolvePerspectivesBlocComponent(
  stepIndex: number,
  state: TaeFormState,
): ComponentType | null {
  const config = getWizardBlocConfig(state.bloc2.comportementId);
  if (!config) return null;

  if (stepIndex === TAE_REDACTION_STEP_INDEX) {
    switch (config.bloc3.type) {
      case "modele_souple":
        return Bloc3ModeleSouple;
      case "structure":
        return Bloc3TemplateStructure;
      case "pur":
        return Bloc3TemplatePur;
      default:
        return null;
    }
  }

  if (stepIndex === TAE_DOCUMENTS_STEP_INDEX) {
    if (config.bloc4.type === "perspectives") return Bloc4Perspectives;
    if (config.bloc4.type === "moments") return Bloc4Moments;
  }

  return null;
}
