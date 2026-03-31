"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import {
  DOCUMENT_MODULE_LEGAL_BODY,
  DOCUMENT_MODULE_LEGAL_CHECKBOX,
  DOCUMENT_MODULE_LEGAL_FOOTER,
  DOCUMENT_MODULE_LEGAL_INTRO,
  DOCUMENT_MODULE_LEGAL_SECTION_HEADING,
} from "@/lib/ui/ui-copy";
import { LegalNoticeIcon } from "@/components/ui/LegalNoticeIcon";
import { RequiredMark } from "@/components/ui/RequiredMark";

export function StepConfirmation() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AutonomousDocumentFormValues>();
  const legalId = useId();
  const legalHeadingId = useId();

  return (
    <div className="space-y-4">
      <div
        className="space-y-3 rounded-xl border border-border bg-panel-alt/40 p-4 text-sm leading-relaxed text-deep"
        role="region"
        aria-labelledby={legalHeadingId}
      >
        <h3 id={legalHeadingId} className="icon-text m-0 text-base font-semibold text-deep">
          <LegalNoticeIcon />
          {DOCUMENT_MODULE_LEGAL_SECTION_HEADING}
        </h3>
        <p>{DOCUMENT_MODULE_LEGAL_INTRO}</p>
        <p>{DOCUMENT_MODULE_LEGAL_BODY}</p>
        <p className="text-muted">{DOCUMENT_MODULE_LEGAL_FOOTER}</p>
        <label className="flex cursor-pointer items-start gap-3 pt-2">
          <input
            id={legalId}
            type="checkbox"
            {...register("legal_accepted")}
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <span>
            {DOCUMENT_MODULE_LEGAL_CHECKBOX} <RequiredMark />
          </span>
        </label>
        {errors.legal_accepted ? (
          <p className="text-sm text-error" role="alert">
            {errors.legal_accepted.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
