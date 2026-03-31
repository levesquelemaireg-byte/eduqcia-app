"use client";

import { useId, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SimpleModal } from "@/components/ui/SimpleModal";
import {
  DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_BODY,
  DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_TITLE,
  DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_BODY,
  DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_TITLE,
  DOCUMENT_MODULE_SOURCE_PRIMAIRE,
  DOCUMENT_MODULE_SOURCE_SECONDAIRE,
  DOCUMENT_MODULE_SOURCE_TYPE_LABEL,
} from "@/lib/ui/ui-copy";

type Props = {
  value: "primaire" | "secondaire" | null | undefined;
  onChange: (next: "primaire" | "secondaire") => void;
  errorMessage?: string;
};

type HelpKey = "primaire" | "secondaire";

/**
 * Type de source — radios + aide (i) → `SimpleModal` (même pattern que le wizard TAÉ, `LabelWithInfo` / Bloc 3).
 */
export function SourceTypeRadiosWithTooltips({ value, onChange, errorMessage }: Props) {
  const groupId = useId();
  const [helpOpen, setHelpOpen] = useState<HelpKey | null>(null);

  return (
    <>
      <SimpleModal
        open={helpOpen === "primaire"}
        title={DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_TITLE}
        onClose={() => setHelpOpen(null)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_BODY}
        </p>
      </SimpleModal>
      <SimpleModal
        open={helpOpen === "secondaire"}
        title={DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_TITLE}
        onClose={() => setHelpOpen(null)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">
          {DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_BODY}
        </p>
      </SimpleModal>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_SOURCE_TYPE_LABEL} <RequiredMark />
        </legend>
        {errorMessage ? (
          <p className="text-sm text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-4" role="presentation">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-deep">
            <input
              type="radio"
              name={groupId}
              checked={value === "primaire"}
              onChange={() => onChange("primaire")}
              className="h-4 w-4 shrink-0 border-border"
            />
            {DOCUMENT_MODULE_SOURCE_PRIMAIRE}
            <FieldHelpModalButton onClick={() => setHelpOpen("primaire")} />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-deep">
            <input
              type="radio"
              name={groupId}
              checked={value === "secondaire"}
              onChange={() => onChange("secondaire")}
              className="h-4 w-4 shrink-0 border-border"
            />
            {DOCUMENT_MODULE_SOURCE_SECONDAIRE}
            <FieldHelpModalButton onClick={() => setHelpOpen("secondaire")} />
          </label>
        </div>
      </fieldset>
    </>
  );
}
