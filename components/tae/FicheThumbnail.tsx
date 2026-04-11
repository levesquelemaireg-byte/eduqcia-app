"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { TAE_LECTURE_SECTIONS } from "@/lib/fiche/configs/tae-lecture-sections";
import type { TaeFicheData } from "@/lib/types/fiche";
import type { SelectorRefs } from "@/lib/fiche/types";

type Props = {
  tae: TaeFicheData;
};

/** Stub refs — lecture selectors don't use oiList or previewMeta. */
const EMPTY_OI_LIST: SelectorRefs["oiList"] = [];
const EMPTY_PREVIEW_META: SelectorRefs["previewMeta"] = {
  authorFullName: "",
  draftStartedAtIso: "",
};

/**
 * Vignette TAÉ — FicheRenderer mode `thumbnail`.
 * Affiche uniquement header compact + consigne tronquée (line-clamp 3).
 * Cliquable vers la fiche complète.
 */
export function FicheThumbnail({ tae }: Props) {
  const refs = useMemo<SelectorRefs>(
    () => ({ oiList: EMPTY_OI_LIST, previewMeta: EMPTY_PREVIEW_META }),
    [],
  );

  return (
    <Link href={`/questions/${tae.id}`} className="block transition-shadow hover:shadow-md">
      <FicheRenderer
        sections={TAE_LECTURE_SECTIONS}
        state={tae}
        refs={refs}
        mode="thumbnail"
        activeStepId={null}
      />
    </Link>
  );
}
