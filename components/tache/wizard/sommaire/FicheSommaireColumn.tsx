"use client";

import { useMemo } from "react";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { TACHE_FICHE_SECTIONS } from "@/lib/fiche/configs/tache-fiche-sections";
import { TACHE_FICHE_SECTIONS_B } from "@/lib/fiche/configs/tache-fiche-sections-b";
import { getCurrentStepId } from "@/lib/fiche/getCurrentStepId";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { useOiData, useGrilles } from "@/components/tache/wizard/bloc2/useBloc2Data";
import { resoudreParcours } from "@/lib/tache/parcours/resolveur";
import type { SelectorRefs } from "@/lib/fiche/types";

type Props = {
  previewMeta: {
    authorFullName: string;
    draftStartedAtIso: string;
  };
};

/** Sommaire formulaire — FicheRenderer mode `sommaire`. */
export function FicheSommaireColumn({ previewMeta }: Props) {
  const { state } = useTacheForm();
  const { oiList } = useOiData();
  const grilles = useGrilles();

  // Stabiliser refs — ne pas invalider tous les selectors à chaque render
  const refs = useMemo<SelectorRefs>(
    () => ({ oiList: oiList ?? [], grilles: grilles ?? [], previewMeta }),
    [oiList, grilles, previewMeta],
  );

  const activeStepId = getCurrentStepId(state.currentStep);

  if (!oiList || oiList.length === 0) {
    return <div className="h-48 w-full animate-pulse rounded-xl bg-border/40" aria-hidden="true" />;
  }

  const parcours = resoudreParcours(state.bloc2.typeTache);
  const sections =
    parcours.id === "section-b-schema-cd1" ? TACHE_FICHE_SECTIONS_B : TACHE_FICHE_SECTIONS;

  return (
    <FicheRenderer
      sections={sections}
      state={state}
      refs={refs}
      mode="sommaire"
      activeStepId={activeStepId}
    />
  );
}
