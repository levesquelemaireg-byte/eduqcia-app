"use client";

/**
 * Bloc 5 — corrigé intrus (OI3 · 3.3/3.4/3.5).
 * Radios pour identifier la perspective différente + explication + point commun.
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § OI3 · Bloc 5 — Intrus
 */
import { useMemo } from "react";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RequiredMark } from "@/components/ui/RequiredMark";
import { intrusRadioLabels } from "@/lib/tache/oi-perspectives/perspectives-helpers";
import { emptyPerspective } from "@/lib/tache/oi-perspectives/perspectives-helpers";
import type { PerspectiveLetter } from "@/lib/tache/oi-perspectives/perspectives-types";
import type { Bloc5Props } from "@/lib/tache/tae-form-state-types";
import {
  PERSP_BLOC5_INTRUS_LABEL,
  PERSP_BLOC5_DIFFERENCE_LABEL,
  PERSP_BLOC5_COMMUN_LABEL,
} from "@/lib/ui/ui-copy";

export default function Bloc5Intrus({ state, dispatch }: Bloc5Props) {
  const perspectives = state.bloc4.perspectives;
  const intrus = state.bloc5.intrus ?? {
    intrusLetter: "" as const,
    explicationDifference: "",
    pointCommun: "",
  };

  const radioOptions = useMemo(() => {
    const persp = perspectives ?? [emptyPerspective(), emptyPerspective(), emptyPerspective()];
    return intrusRadioLabels(persp).map((r) => ({
      value: r.letter,
      label: `Perspective ${r.letter} — ${r.label}`,
    }));
  }, [perspectives]);

  return (
    <div className="space-y-5">
      {/* Choix de l'intrus */}
      <RadioCardGroup
        name="intrusLetter"
        label={PERSP_BLOC5_INTRUS_LABEL}
        required
        columns={1}
        options={radioOptions}
        value={intrus.intrusLetter}
        onChange={(v) =>
          dispatch({ type: "SET_INTRUS_LETTER", value: v as PerspectiveLetter | "" })
        }
      />

      {/* Explication de la différence */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-deep">
          {PERSP_BLOC5_DIFFERENCE_LABEL} <RequiredMark />
        </p>
        <RichTextEditor
          instanceId="intrus-explication"
          value={intrus.explicationDifference}
          onChange={(html) => dispatch({ type: "SET_INTRUS_EXPLICATION", value: html })}
          minHeight={80}
          toolbarAriaLabel="Mise en forme — explication de la différence"
          aria-required={true}
        />
      </div>

      {/* Point commun des deux autres */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-deep">
          {PERSP_BLOC5_COMMUN_LABEL} <RequiredMark />
        </p>
        <RichTextEditor
          instanceId="intrus-point-commun"
          value={intrus.pointCommun}
          onChange={(html) => dispatch({ type: "SET_INTRUS_POINT_COMMUN", value: html })}
          minHeight={80}
          toolbarAriaLabel="Mise en forme — point commun"
          aria-required={true}
        />
      </div>
    </div>
  );
}
