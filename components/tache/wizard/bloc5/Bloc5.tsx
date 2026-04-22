"use client";

// Résolveur des variantes Bloc 5 (étape 5 du wizard, corrigé/options).
// Choisit entre Bloc5Intrus (cas spécial perspectives OI3.5), Bloc5Redactionnel,
// ou les variantes NR (OrdreChronologique, LigneDuTemps, AvantApres).
// Le routage des Blocs 3 et 4 est dans lib/tache/wizardBlocResolver.tsx,
// qui suit un pattern similaire mais opère sur un périmètre distinct.
// Cette séparation est volontaire : chaque résolveur a une responsabilité unique
// sur un périmètre clair, conformément au principe de séparation des responsabilités.

import dynamic from "next/dynamic";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import { resolveComportementSlug } from "@/lib/tache/behaviours/comportement-slug";
import { BLOC5_DYNAMIC_BY_SLUG } from "@/lib/tache/behaviours/registry";
import { getWizardBlocConfig } from "@/lib/tache/wizard-bloc-config";
import type { Bloc5Props } from "@/lib/tache/tae-form-state-types";
import type { ComponentType } from "react";

const Bloc5IntrusDynamic: ComponentType<Bloc5Props> = dynamic(
  () => import("@/components/tache/wizard/bloc5/Bloc5Intrus"),
  { ssr: false },
);

/**
 * Bloc 5 — corrigé / options.
 * Vérifie d'abord `WizardBlocConfig` (perspectives intrus),
 * puis tombe sur `BLOC5_DYNAMIC_BY_SLUG` (NR / rédactionnel).
 */
export function Bloc5() {
  const { state, dispatch } = useTaeForm();

  const config = getWizardBlocConfig(state.bloc2.comportementId);
  if (config?.bloc5?.type === "intrus") {
    return <Bloc5IntrusDynamic dispatch={dispatch} state={state} />;
  }

  const slug = resolveComportementSlug(state.bloc2.comportementId);
  const Comp = BLOC5_DYNAMIC_BY_SLUG[slug];
  return <Comp dispatch={dispatch} state={state} />;
}
