import { createElement } from "react";
import type {
  SectionConfig,
  FicheSectionEntry,
  SelectorRefs,
  FicheMode,
  SectionRenderResult,
} from "@/lib/fiche/types";

/**
 * Factory typée qui lie le type de retour du selector au type attendu par le component.
 * TypeScript infère TData automatiquement — impossible de mismatch.
 *
 * Retourne un FicheSectionEntry<TState> avec closure `resolve()` :
 * le renderer n'a pas besoin de connaître TData — pas de `any`.
 */
export function defineSection<TState, TData>(
  config: SectionConfig<TState, TData>,
): FicheSectionEntry<TState> {
  const { id, stepId, visibleIn, skeleton: skeletonComponent, selector, component } = config;

  return {
    id,
    stepId,
    visibleIn,
    skeletonComponent,
    resolve(state: TState, refs: SelectorRefs, mode: FicheMode): SectionRenderResult {
      const result = selector(state, refs);
      if (result.status === "hidden") return { status: "hidden" };
      if (result.status === "skeleton") return { status: "skeleton" };
      return {
        status: "ready",
        node: createElement(component, { data: result.data, mode }),
      };
    },
  };
}
