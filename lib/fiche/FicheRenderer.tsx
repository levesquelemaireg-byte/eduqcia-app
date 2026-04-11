"use client";

import { Fragment, type ComponentType } from "react";
import type { FicheSectionEntry, SelectorRefs, FicheMode, StepId } from "@/lib/fiche/types";
import { FicheSection } from "@/lib/fiche/FicheSection";
import { GenericSkeleton } from "@/lib/fiche/GenericSkeleton";
import { FICHE_HAIRLINE_RULE } from "@/lib/ui/fiche-layout";
import { cn } from "@/lib/utils/cn";

type Props<TState> = {
  sections: readonly FicheSectionEntry<TState>[];
  state: TState;
  refs: SelectorRefs;
  mode: FicheMode;
  activeStepId: StepId | null;
};

/**
 * Renderer générique de fiche — aucune connaissance métier.
 * Itère le tableau de sections, filtre par `visibleIn`, résout via closure `resolve()`,
 * et rend chaque section dans un FicheSection wrapper avec hairlines entre les blocs.
 */
export function FicheRenderer<TState>({
  sections,
  state,
  refs,
  mode,
  activeStepId,
}: Props<TState>) {
  // Filtrer AVANT d'appeler resolve (pas de calcul inutile)
  const visibleSections = sections.filter((s) => !s.visibleIn || s.visibleIn.includes(mode));

  // Résoudre toutes les sections et collecter les résultats
  const resolved = visibleSections.map((entry) => ({
    entry,
    result: entry.resolve(state, refs, mode),
  }));

  // Filtrer les hidden pour ne pas compter dans les hairlines
  const renderable = resolved.filter((r) => r.result.status !== "hidden");

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-br-[18px] rounded-tr-[18px] border border-border border-l-2 border-l-accent bg-panel",
        mode === "sommaire" ? "shadow-[var(--wizard-preview-card-shadow)]" : "shadow-sm",
      )}
    >
      {renderable.map(({ entry, result }, i) => {
        const isActive = activeStepId != null && activeStepId === entry.stepId;
        const Skeleton: ComponentType | undefined = entry.skeletonComponent;

        return (
          <Fragment key={entry.id}>
            {i > 0 ? <div className={FICHE_HAIRLINE_RULE} aria-hidden="true" /> : null}
            <FicheSection isActive={isActive} sectionId={entry.id}>
              {result.status === "skeleton" ? (
                Skeleton ? (
                  <Skeleton />
                ) : (
                  <GenericSkeleton />
                )
              ) : (
                result.status === "ready" && result.node
              )}
            </FicheSection>
          </Fragment>
        );
      })}
    </article>
  );
}
