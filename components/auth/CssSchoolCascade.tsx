"use client";

import { useMemo } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { RequiredMark } from "@/components/ui/RequiredMark";
import type { RegisterFormValues } from "@/lib/schemas/auth";
import type { CssOption, SchoolOption } from "@/lib/queries/css-schools";
import { SELECT_PLACEHOLDER_CSS, SELECT_PLACEHOLDER_ECOLE } from "@/lib/ui/ui-copy";

type Props = {
  cssList: CssOption[];
  allSchools: SchoolOption[];
  control: Control<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  cssId: string;
  showSchool: boolean;
};

export function CssSchoolCascade({
  cssList,
  allSchools,
  control,
  errors,
  cssId,
  showSchool,
}: Props) {
  const cssOptions = useMemo(
    () => cssList.map((c) => ({ value: c.id, label: c.nomOfficiel })),
    [cssList],
  );

  const schoolOptions = useMemo(
    () =>
      cssId
        ? allSchools
            .filter((s) => s.cssId === cssId)
            .map((s) => ({ value: s.id, label: s.nomOfficiel }))
        : [],
    [allSchools, cssId],
  );

  return (
    <>
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="css_id" className="text-sm font-medium text-deep">
          Centre de services scolaires
        </label>
        <Controller
          name="css_id"
          control={control}
          render={({ field }) => (
            <ComboboxField
              id="css_id"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={SELECT_PLACEHOLDER_CSS}
              error={!!errors.css_id}
              aria-invalid={errors.css_id ? true : undefined}
              aria-describedby={errors.css_id ? "css_id-error" : undefined}
              options={cssOptions}
            />
          )}
        />
        {errors.css_id ? (
          <p id="css_id-error" className="text-sm font-medium text-error" role="alert">
            {errors.css_id.message}
          </p>
        ) : null}
      </div>

      {showSchool ? (
        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="school_id" className="text-sm font-medium text-deep">
            École secondaire <RequiredMark />
          </label>
          <Controller
            key={cssId || "none"}
            name="school_id"
            control={control}
            render={({ field }) => (
              <ComboboxField
                id="school_id"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={!cssId}
                placeholder={SELECT_PLACEHOLDER_ECOLE}
                error={!!errors.school_id}
                aria-invalid={errors.school_id ? true : undefined}
                aria-describedby={errors.school_id ? "school_id-error" : undefined}
                aria-required
                options={schoolOptions}
              />
            )}
          />
          {errors.school_id ? (
            <p id="school_id-error" className="text-sm font-medium text-error" role="alert">
              {errors.school_id.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
