"use client";

import { useMemo } from "react";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { TACHE_LECTURE_SECTIONS } from "@/lib/fiche/configs/tache-lecture-sections";
import { TacheCardMenu } from "@/components/tache/fiche/TacheCardMenu";
import { useGrilles } from "@/components/tache/wizard/bloc2/useBloc2Data";
import type { TacheFicheData } from "@/lib/types/fiche";
import type { SelectorRefs } from "@/lib/fiche/types";

type Props = {
  tache: TacheFicheData;
  userId?: string;
};

/** Stub refs — lecture selectors don't use oiList or previewMeta (data is pre-processed). */
const EMPTY_OI_LIST: SelectorRefs["oiList"] = [];
const EMPTY_PREVIEW_META: SelectorRefs["previewMeta"] = {
  authorFullName: "",
  draftStartedAtIso: "",
};

/** Fiche TAÉ en mode lecture — FicheRenderer + TacheCardMenu. */
export function FicheLecture({ tache, userId }: Props) {
  const isAuteur = Boolean(userId && tache.auteur_id === userId);
  const grilles = useGrilles();

  const refs = useMemo<SelectorRefs>(
    () => ({ oiList: EMPTY_OI_LIST, grilles: grilles ?? [], previewMeta: EMPTY_PREVIEW_META }),
    [grilles],
  );

  return (
    <div className="relative" data-fiche-menu-shell>
      {/* Menu ⋮ — coin supérieur droit, au-dessus du FicheRenderer */}
      <div className="pointer-events-none absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
        <div className="pointer-events-auto">
          <TacheCardMenu
            tacheId={tache.id}
            isAuteur={isAuteur}
            menuContext="lecture"
            printHref={`/questions/${tache.id}/print`}
          />
        </div>
      </div>

      <FicheRenderer
        sections={TACHE_LECTURE_SECTIONS}
        state={tache}
        refs={refs}
        mode="lecture"
        activeStepId={null}
      />
    </div>
  );
}
