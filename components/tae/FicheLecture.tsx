"use client";

import { useMemo } from "react";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { TAE_LECTURE_SECTIONS } from "@/lib/fiche/configs/tae-lecture-sections";
import { TaeCardMenu } from "@/components/tae/fiche/TaeCardMenu";
import type { TaeFicheData } from "@/lib/types/fiche";
import type { SelectorRefs } from "@/lib/fiche/types";

type Props = {
  tae: TaeFicheData;
  userId?: string;
};

/** Stub refs — lecture selectors don't use oiList or previewMeta (data is pre-processed). */
const EMPTY_OI_LIST: SelectorRefs["oiList"] = [];
const EMPTY_PREVIEW_META: SelectorRefs["previewMeta"] = {
  authorFullName: "",
  draftStartedAtIso: "",
};

/** Fiche TAÉ en mode lecture — FicheRenderer + TaeCardMenu. */
export function FicheLecture({ tae, userId }: Props) {
  const isAuteur = Boolean(userId && tae.auteur_id === userId);

  const refs = useMemo<SelectorRefs>(
    () => ({ oiList: EMPTY_OI_LIST, previewMeta: EMPTY_PREVIEW_META }),
    [],
  );

  return (
    <div className="relative" data-fiche-menu-shell>
      {/* Menu ⋮ — coin supérieur droit, au-dessus du FicheRenderer */}
      <div className="pointer-events-none absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
        <div className="pointer-events-auto">
          <TaeCardMenu
            taeId={tae.id}
            isAuteur={isAuteur}
            menuContext="lecture"
            printHref={`/questions/${tae.id}/print`}
          />
        </div>
      </div>

      <FicheRenderer
        sections={TAE_LECTURE_SECTIONS}
        state={tae}
        refs={refs}
        mode="lecture"
        activeStepId={null}
      />
    </div>
  );
}
