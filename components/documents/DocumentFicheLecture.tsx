"use client";

import { useMemo } from "react";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { DOC_FICHE_SECTIONS } from "@/lib/fiche/configs/doc-fiche-sections";
import type { DocFicheData, SelectorRefs } from "@/lib/fiche/types";

type Props = { data: DocFicheData };

const EMPTY_REFS: SelectorRefs = {
  oiList: [],
  grilles: [],
  previewMeta: { authorFullName: "", draftStartedAtIso: "" },
};

/** Fiche document en mode lecture — wrapper FicheRenderer + DOC_FICHE_SECTIONS. */
export function DocumentFicheLecture({ data }: Props) {
  const refs = useMemo<SelectorRefs>(() => EMPTY_REFS, []);
  return (
    <FicheRenderer
      sections={DOC_FICHE_SECTIONS}
      state={data}
      refs={refs}
      mode="lecture"
      activeStepId={null}
    />
  );
}
