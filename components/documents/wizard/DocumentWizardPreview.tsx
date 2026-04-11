"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FicheRenderer } from "@/lib/fiche/FicheRenderer";
import { DOC_FICHE_SECTIONS } from "@/lib/fiche/configs/doc-fiche-sections";
import { formValuesToDocFicheData } from "@/lib/fiche/adapters/form-to-doc-fiche-data";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { SelectorRefs } from "@/lib/fiche/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  /** Aperçu embarqué sous le formulaire (mobile) — un peu plus compact. */
  compact?: boolean;
};

const EMPTY_REFS: SelectorRefs = {
  oiList: [],
  grilles: [],
  previewMeta: { authorFullName: "", draftStartedAtIso: "" },
};

/**
 * Aperçu document wizard — FicheRenderer mode sommaire.
 * Lit les données depuis le formulaire via `useFormContext`.
 */
export function DocumentWizardPreview({ className, compact }: Props) {
  const { watch } = useFormContext<AutonomousDocumentFormValues>();
  const values = watch();
  const refs = useMemo<SelectorRefs>(() => EMPTY_REFS, []);

  const data = useMemo(() => formValuesToDocFicheData(values), [values]);

  return (
    <div className={cn("flex justify-center", className)}>
      <div
        className={cn("w-full max-w-full", compact && "origin-top scale-[0.92] max-xl:scale-100")}
      >
        <FicheRenderer
          sections={DOC_FICHE_SECTIONS}
          state={data}
          refs={refs}
          mode="sommaire"
          activeStepId={null}
        />
      </div>
    </div>
  );
}
