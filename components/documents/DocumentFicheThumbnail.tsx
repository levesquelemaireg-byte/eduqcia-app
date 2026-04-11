"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { DOC_FICHE_SECTIONS } from "@/lib/fiche/configs/doc-fiche-sections";
import type { DocFicheData, SelectorRefs } from "@/lib/fiche/types";

type Props = {
  data: DocFicheData;
  href: string;
};

const EMPTY_REFS: SelectorRefs = {
  oiList: [],
  grilles: [],
  previewMeta: { authorFullName: "", draftStartedAtIso: "" },
};

/** Vignette document — FicheRenderer mode thumbnail, cliquable. */
export function DocumentFicheThumbnail({ data, href }: Props) {
  const refs = useMemo<SelectorRefs>(() => EMPTY_REFS, []);
  return (
    <Link href={href} className="block transition-shadow hover:shadow-md">
      <FicheRenderer
        sections={DOC_FICHE_SECTIONS}
        state={data}
        refs={refs}
        mode="thumbnail"
        activeStepId={null}
      />
    </Link>
  );
}
