"use client";

import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { resolveComportementSlug } from "@/lib/tae/behaviours/comportement-slug";
import { BLOC5_DYNAMIC_BY_SLUG } from "@/lib/tae/behaviours/registry";

/**
 * Bloc 5 — corrigé / options — `BLOC5_DYNAMIC_BY_SLUG` est défini dans `registry.ts` avec `next/dynamic` au chargement du module.
 * Utiliser `getBloc5DynamicComponent(slug)` ailleurs ; ici indexation directe du record (règle `react-hooks/static-components`).
 */
export function Bloc5() {
  const { state, dispatch } = useTaeForm();
  const slug = resolveComportementSlug(state.bloc2.comportementId);
  const Comp = BLOC5_DYNAMIC_BY_SLUG[slug];
  return <Comp dispatch={dispatch} state={state} />;
}
