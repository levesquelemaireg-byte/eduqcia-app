"use client";

import { useId, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DocumentWizardMillerConnaissances } from "@/components/documents/wizard/DocumentWizardMillerConnaissances";
import { FieldHelpModalButton } from "@/components/ui/FieldHelpModalButton";
import { ListboxField } from "@/components/ui/ListboxField";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { refIdsEqual } from "@/lib/documents/ref-id";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DisciplineOption, NiveauOption } from "@/lib/queries/document-ref-data";
import { ASPECT_LABEL } from "@/lib/tae/aspect-labels";
import type { DisciplineCode, NiveauCode } from "@/lib/tae/blueprint-helpers";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import {
  DOCUMENT_MODULE_ASPECTS_LABEL,
  DOCUMENT_MODULE_INDEX_CONNAISSANCES,
  DOCUMENT_MODULE_INDEX_DISCIPLINE,
  DOCUMENT_MODULE_INDEX_NIVEAU,
  DOCUMENT_WIZARD_CONN_HELP,
  DOCUMENT_WIZARD_LISTBOX_PLACEHOLDER,
} from "@/lib/ui/ui-copy";

const ASPECT_KEYS = Object.keys(ASPECT_LABEL) as AspectSocieteKey[];

type Props = {
  niveaux: NiveauOption[];
  disciplineOptions: DisciplineOption[];
};

export function StepClassification({ niveaux, disciplineOptions }: Props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AutonomousDocumentFormValues>();

  const niveauId = watch("niveau_id");
  const disciplineId = watch("discipline_id");
  const [connHelpOpen, setConnHelpOpen] = useState(false);
  const connFieldsetLabelId = useId();

  const niveauOptions = useMemo(
    () => niveaux.map((n) => ({ value: String(n.id), label: n.label })),
    [niveaux],
  );
  const discOpts = useMemo(
    () => disciplineOptions.map((d) => ({ value: String(d.id), label: d.label })),
    [disciplineOptions],
  );

  const niveauCode = useMemo((): NiveauCode | "" => {
    const row = niveaux.find((n) => refIdsEqual(n.id, niveauId));
    if (!row?.code) return "";
    const c = row.code as NiveauCode;
    if (c === "sec1" || c === "sec2" || c === "sec3" || c === "sec4") return c;
    return "";
  }, [niveaux, niveauId]);

  const disciplineCode = useMemo((): DisciplineCode | "" => {
    const row = disciplineOptions.find((d) => refIdsEqual(d.id, disciplineId));
    if (!row?.code) return "";
    const low = String(row.code).toLowerCase();
    if (low === "hec" || low === "hqc" || low === "geo") return low as DisciplineCode;
    return "";
  }, [disciplineOptions, disciplineId]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="doc-wizard-niveau" className="text-sm font-medium text-deep">
            {DOCUMENT_MODULE_INDEX_NIVEAU} <RequiredMark />
          </label>
          <Controller
            name="niveau_id"
            control={control}
            render={({ field }) => (
              <ListboxField
                id="doc-wizard-niveau"
                ref={field.ref}
                value={field.value > 0 ? String(field.value) : ""}
                onChange={(v) => {
                  const n = v ? Number(v) : 0;
                  setValue("niveau_id", n, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  setValue("connaissances_miller", []);
                }}
                allowEmpty
                placeholder={DOCUMENT_WIZARD_LISTBOX_PLACEHOLDER}
                error={!!errors.niveau_id}
                aria-invalid={errors.niveau_id ? true : undefined}
                aria-describedby={errors.niveau_id ? "doc-wizard-niveau-error" : undefined}
                aria-required
                options={niveauOptions}
              />
            )}
          />
          {errors.niveau_id ? (
            <p id="doc-wizard-niveau-error" className="text-sm font-medium text-error" role="alert">
              {errors.niveau_id.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="doc-wizard-discipline" className="text-sm font-medium text-deep">
            {DOCUMENT_MODULE_INDEX_DISCIPLINE} <RequiredMark />
          </label>
          <Controller
            name="discipline_id"
            control={control}
            render={({ field }) => (
              <ListboxField
                id="doc-wizard-discipline"
                ref={field.ref}
                value={field.value > 0 ? String(field.value) : ""}
                onChange={(v) => {
                  const n = v ? Number(v) : 0;
                  setValue("discipline_id", n, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                  setValue("connaissances_miller", []);
                }}
                allowEmpty
                placeholder={DOCUMENT_WIZARD_LISTBOX_PLACEHOLDER}
                error={!!errors.discipline_id}
                aria-invalid={errors.discipline_id ? true : undefined}
                aria-describedby={errors.discipline_id ? "doc-wizard-discipline-error" : undefined}
                aria-required
                options={discOpts}
              />
            )}
          />
          {errors.discipline_id ? (
            <p
              id="doc-wizard-discipline-error"
              className="text-sm font-medium text-error"
              role="alert"
            >
              {errors.discipline_id.message}
            </p>
          ) : null}
        </div>
      </div>

      <SimpleModal
        open={connHelpOpen}
        title={DOCUMENT_MODULE_INDEX_CONNAISSANCES}
        onClose={() => setConnHelpOpen(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{DOCUMENT_WIZARD_CONN_HELP}</p>
      </SimpleModal>

      <fieldset className="space-y-2" aria-labelledby={connFieldsetLabelId}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span id={connFieldsetLabelId} className="text-sm font-semibold text-deep">
            {DOCUMENT_MODULE_INDEX_CONNAISSANCES}
          </span>
          <FieldHelpModalButton onClick={() => setConnHelpOpen(true)} />
        </div>
        {errors.connaissances_miller ? (
          <p className="text-sm text-error" role="alert">
            {errors.connaissances_miller.message as string}
          </p>
        ) : null}
        <DocumentWizardMillerConnaissances
          key={`${niveauId}-${disciplineId}`}
          niveauCode={niveauCode}
          disciplineCode={disciplineCode}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-deep">
          {DOCUMENT_MODULE_ASPECTS_LABEL} <RequiredMark />
        </legend>
        {errors.aspects ? (
          <p className="text-sm text-error" role="alert">
            {errors.aspects.message as string}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {ASPECT_KEYS.map((key) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-deep">
              <Controller
                name={`aspects.${key}`}
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                )}
              />
              {ASPECT_LABEL[key]}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
