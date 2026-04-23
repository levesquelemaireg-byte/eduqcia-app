"use client";

import { useId } from "react";
import { useTacheForm } from "@/components/tache/wizard/FormState";
import { ListboxField, type ListboxOption } from "@/components/ui/ListboxField";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";

const ASPECT_KEYS: AspectSocieteKey[] = [
  "economique",
  "politique",
  "social",
  "culturel",
  "territorial",
];

function buildOptions(excluded: AspectSocieteKey | null): ListboxOption[] {
  return ASPECT_KEYS.map((key) => ({
    value: key,
    label: ASPECT_LABEL[key],
    disabled: excluded === key,
  }));
}

function coerceAspectOrNull(value: string): AspectSocieteKey | null {
  if ((ASPECT_KEYS as string[]).includes(value)) return value as AspectSocieteKey;
  return null;
}

export function SelecteurAspects() {
  const { state, dispatch } = useTacheForm();
  const { aspectA, aspectB, blueprintLocked } = state.bloc2;
  const idA = useId();
  const idB = useId();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor={idA} className="text-sm font-semibold text-deep">
          Premier aspect de société <RequiredMark />
        </label>
        <ListboxField
          id={idA}
          value={aspectA ?? ""}
          onChange={(v) => dispatch({ type: "SET_ASPECT_A", value: coerceAspectOrNull(v) })}
          allowEmpty
          placeholder="Sélectionner un aspect"
          options={buildOptions(aspectB)}
          disabled={blueprintLocked}
          aria-required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={idB} className="text-sm font-semibold text-deep">
          Deuxième aspect de société <RequiredMark />
        </label>
        <ListboxField
          id={idB}
          value={aspectB ?? ""}
          onChange={(v) => dispatch({ type: "SET_ASPECT_B", value: coerceAspectOrNull(v) })}
          allowEmpty
          placeholder="Sélectionner un aspect"
          options={buildOptions(aspectA)}
          disabled={blueprintLocked}
          aria-required
          className="w-full"
        />
      </div>
    </div>
  );
}
