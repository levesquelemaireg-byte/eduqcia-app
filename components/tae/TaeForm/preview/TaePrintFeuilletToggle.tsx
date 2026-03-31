"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import {
  EVAL_PRINT_SECTION_COPY,
  WIZARD_PRINT_PREVIEW_COPY,
} from "@/components/tae/TaeForm/preview/wizard-print-preview-copy";

export type TaePrintFeuilletId = "dossier" | "questionnaire";

type Props = {
  active: TaePrintFeuilletId;
  onChange: (id: TaePrintFeuilletId) => void;
  className?: string;
};

/**
 * Bascule écran entre les deux feuillets (dossier / questionnaire).
 * À l’impression, les deux panneaux sont rendus ; le masquage ne s’applique qu’en aperçu écran.
 */
export function TaePrintFeuilletToggle({ active, onChange, className }: Props) {
  return (
    <div
      role="tablist"
      aria-label={WIZARD_PRINT_PREVIEW_COPY.feuilletToolbarAriaLabel}
      className={cn("print:hidden flex flex-wrap justify-center gap-2", className)}
    >
      <Button
        type="button"
        role="tab"
        aria-selected={active === "dossier"}
        variant={active === "dossier" ? "primary" : "secondary"}
        onClick={() => onChange("dossier")}
      >
        {EVAL_PRINT_SECTION_COPY.dossierDocumentaire}
      </Button>
      <Button
        type="button"
        role="tab"
        aria-selected={active === "questionnaire"}
        variant={active === "questionnaire" ? "primary" : "secondary"}
        onClick={() => onChange("questionnaire")}
      >
        {EVAL_PRINT_SECTION_COPY.questionnaire}
      </Button>
    </div>
  );
}
