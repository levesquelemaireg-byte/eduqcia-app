// Résolveur des variantes Bloc 3 et Bloc 4 selon le comportement attendu.
// Couvre uniquement les étapes 3 (rédaction/consigne) et 4 (documents).
// Le routage du Bloc 5 est dans bloc5/Bloc5.tsx, qui suit un pattern similaire
// mais opère sur un périmètre distinct (cas intrus, variantes NR, rédactionnel).
// Cette séparation est volontaire : chaque résolveur a une responsabilité unique
// sur un périmètre clair, conformément au principe de séparation des responsabilités.

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { Bloc3AvantApres } from "@/components/tache/non-redaction/avant-apres/Bloc3AvantApres";
import { Bloc4AvantApres } from "@/components/tache/non-redaction/avant-apres/Bloc4AvantApres";
import { Bloc3LigneDuTemps } from "@/components/tache/non-redaction/ligne-du-temps/Bloc3LigneDuTemps";
import { Bloc4LigneDuTemps } from "@/components/tache/non-redaction/ligne-du-temps/Bloc4LigneDuTemps";
import { Bloc3OrdreChronologique } from "@/components/tache/non-redaction/ordre-chronologique/Bloc3OrdreChronologique";
import { Bloc4OrdreChronologique } from "@/components/tache/non-redaction/ordre-chronologique/Bloc4OrdreChronologique";
import { assertNever } from "@/lib/tache/assert-never";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import type { TacheNonRedactionVariantSlug } from "@/lib/tache/non-redaction/variant-slugs";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import {
  TACHE_DOCUMENTS_STEP_INDEX,
  TACHE_REDACTION_STEP_INDEX,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";

type VariantBlocPair = {
  Bloc3: ComponentType;
  Bloc4: ComponentType;
};

/**
 * Paires Bloc3 / Bloc4 par slug — à remplir lorsque l’UI variante est livrée.
 * Tant qu’une entrée manque, le wizard conserve les blocs rédactionnels par défaut.
 */
export const TACHE_NON_REDACTION_WIZARD_BLOCS: Partial<
  Record<TacheNonRedactionVariantSlug, VariantBlocPair>
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
  state: TacheFormState,
): ComponentType | null {
  if (stepIndex !== TACHE_REDACTION_STEP_INDEX && stepIndex !== TACHE_DOCUMENTS_STEP_INDEX) {
    return null;
  }
  const parcours = resoudreParcours(state.bloc2.typeTache);
  if (parcours.bloc3Type === "schema_cd1" || parcours.bloc3Type === "interpretation_cd2") {
    // Sections B et C — composants non implémentés, le parent rend un squelette.
    return null;
  }
  const slug = getVariantSlugForComportementId(state.bloc2.comportementId);
  if (!slug) return resolvePerspectivesBlocComponent(stepIndex, state);
  const pair = TACHE_NON_REDACTION_WIZARD_BLOCS[slug];
  if (!pair) return null;
  return stepIndex === TACHE_REDACTION_STEP_INDEX ? pair.Bloc3 : pair.Bloc4;
}

// ---------------------------------------------------------------------------
// Perspectives OI3 — branchement par WizardBlocConfig (pas de variant_slug)
// ---------------------------------------------------------------------------

const Bloc3ModeleSouple = dynamic(
  () => import("@/components/tache/wizard/bloc3/templates/Bloc3ModeleSouple"),
  { ssr: false },
);
const Bloc3TemplateStructure = dynamic(
  () => import("@/components/tache/wizard/bloc3/templates/Bloc3TemplateStructure"),
  { ssr: false },
);
const Bloc3TemplatePur = dynamic(
  () => import("@/components/tache/wizard/bloc3/templates/Bloc3TemplatePur"),
  { ssr: false },
);
const Bloc4Perspectives = dynamic(
  () => import("@/components/tache/wizard/bloc4/Bloc4Perspectives"),
  { ssr: false },
);
const Bloc4Moments = dynamic(() => import("@/components/tache/wizard/bloc4/Bloc4Moments"), {
  ssr: false,
});

function resolvePerspectivesBlocComponent(
  stepIndex: number,
  state: TacheFormState,
): ComponentType | null {
  const config = getWizardBlocConfig(state.bloc2.comportementId);
  if (!config) return null;

  if (stepIndex === TACHE_REDACTION_STEP_INDEX) {
    switch (config.bloc3.type) {
      case "modele_souple":
        return Bloc3ModeleSouple;
      case "structure":
        return Bloc3TemplateStructure;
      case "pur":
        return Bloc3TemplatePur;
      default:
        return assertNever(config.bloc3);
    }
  }

  if (stepIndex === TACHE_DOCUMENTS_STEP_INDEX) {
    if (config.bloc4.type === "perspectives") return Bloc4Perspectives;
    if (config.bloc4.type === "moments") return Bloc4Moments;
  }

  return null;
}
