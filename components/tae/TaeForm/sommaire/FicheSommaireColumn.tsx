"use client";

import { useMemo } from "react";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { TAE_FICHE_SECTIONS } from "@/lib/fiche/configs/tae-fiche-sections";
import { getCurrentStepId } from "@/lib/fiche/getCurrentStepId";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { useOiData, useGrilles } from "@/components/tae/TaeForm/bloc2/useBloc2Data";
import type { SelectorRefs } from "@/lib/fiche/types";

type Props = {
  previewMeta: {
    authorFullName: string;
    draftStartedAtIso: string;
  };
};

/** Sommaire formulaire — FicheRenderer mode `sommaire`. */
export function FicheSommaireColumn({ previewMeta }: Props) {
  const { state } = useTaeForm();
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

  return (
    <FicheRenderer
      sections={TAE_FICHE_SECTIONS}
      state={state}
      refs={refs}
      mode="sommaire"
      activeStepId={activeStepId}
    />
  );
}
