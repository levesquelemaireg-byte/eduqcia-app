"use client";

import dynamic from "next/dynamic";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { resolveComportementSlug } from "@/lib/tae/behaviours/comportement-slug";
import { BLOC5_DYNAMIC_BY_SLUG } from "@/lib/tae/behaviours/registry";
import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
import type { Bloc5Props } from "@/lib/tae/tae-form-state-types";
import type { ComponentType } from "react";

const Bloc5IntrusDynamic: ComponentType<Bloc5Props> = dynamic(
  () => import("@/components/tae/TaeForm/bloc5/Bloc5Intrus"),
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
