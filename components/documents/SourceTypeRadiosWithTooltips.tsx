"use client";

import { useId, useState } from "react";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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

const SOURCE_OPTIONS = [
  { value: "primaire", label: DOCUMENT_MODULE_SOURCE_PRIMAIRE },
  { value: "secondaire", label: DOCUMENT_MODULE_SOURCE_SECONDAIRE },
] as const;

/**
 * Type de source — `SegmentedControl` + aides (i) → `SimpleModal` (Bloc 4 / aligné wizard document).
 */
export function SourceTypeRadiosWithTooltips({ value, onChange, errorMessage }: Props) {
  const legendId = useId();
  const [helpOpen, setHelpOpen] = useState<HelpKey | null>(null);

  const resolved =
    value === "primaire" || value === "secondaire" ? value : "secondaire";

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
        <legend id={legendId} className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_SOURCE_TYPE_LABEL} <RequiredMark />
        </legend>
        {errorMessage ? (
          <p className="text-sm text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <SegmentedControl
          aria-labelledby={legendId}
          options={[...SOURCE_OPTIONS]}
          value={resolved}
          onChange={(v) => {
            if (v === "primaire" || v === "secondaire") onChange(v);
          }}
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <FieldHelpModalButton
              ariaLabel={DOCUMENT_MODULE_MODAL_SOURCE_PRIMAIRE_TITLE}
              onClick={() => setHelpOpen("primaire")}
            />
            <span>{DOCUMENT_MODULE_SOURCE_PRIMAIRE}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <FieldHelpModalButton
              ariaLabel={DOCUMENT_MODULE_MODAL_SOURCE_SECONDAIRE_TITLE}
              onClick={() => setHelpOpen("secondaire")}
            />
            <span>{DOCUMENT_MODULE_SOURCE_SECONDAIRE}</span>
          </span>
        </div>
      </fieldset>
    </>
  );
}
