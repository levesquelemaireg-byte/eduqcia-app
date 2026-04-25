"use client";

import { useCallback, useId, useMemo } from "react";
import { toast } from "sonner";
import { useCarteHistoriquePayloadBootstrap } from "@/components/tache/non-redaction/carte-historique/useCarteHistoriquePayloadBootstrap";
import { ListboxField } from "@/components/ui/ListboxField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  generateCarteHistorique22Options,
  type CarteHistoriquePair,
} from "@/lib/tache/non-redaction/carte-historique-helpers";
import {
  initialCarteHistoriquePayload,
  isCarteHistoriqueComportementId,
  isCarteHistoriqueDocumentsStepComplete,
  isCarteHistoriqueStep3Complete,
  normalizeCarteHistoriquePayload,
  type CarteHistoriqueLetter,
  type CarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";
import {
  NR_CARTE_22_CHIFFRE_LABEL_FOR,
  NR_CARTE_22_CHIFFRE_PLACEHOLDER,
  NR_CARTE_22_CORRECT_BADGE,
  NR_CARTE_22_GENERATE_CTA,
  NR_CARTE_22_GEN_ERROR_INVALID,
  NR_CARTE_22_GEN_ERROR_SAME_DIGITS,
  NR_CARTE_22_REGENERATE_CTA,
  NR_CARTE_22_STEP1_DESCRIPTION,
  NR_CARTE_22_STEP1_TITLE,
  NR_CARTE_22_STEP2_DESCRIPTION,
  NR_CARTE_22_STEP2_TITLE,
  NR_CARTE_22_TABLE_ARIA,
  NR_CARTE_23_LETTER_LABEL_FOR,
  NR_CARTE_BLOC5_HELP_21,
  NR_CARTE_BLOC5_HELP_22,
  NR_CARTE_BLOC5_HELP_23,
  NR_CARTE_BLOC5_TITLE_21,
  NR_CARTE_BLOC5_TITLE_22,
  NR_CARTE_BLOC5_TITLE_23,
  NR_CARTE_GATE_BLOC5,
  NR_CARTE_GATE_PRE_DOCS,
  NR_CARTE_LETTER_GROUP_ARIA,
  NR_CARTE_LETTER_GROUP_ARIA_FOR,
  NR_CARTE_LETTER_OPTION_A,
  NR_CARTE_LETTER_OPTION_B,
  NR_CARTE_LETTER_OPTION_C,
  NR_CARTE_LETTER_OPTION_D,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

const LETTER_OPTIONS = [
  { value: "A", label: NR_CARTE_LETTER_OPTION_A },
  { value: "B", label: NR_CARTE_LETTER_OPTION_B },
  { value: "C", label: NR_CARTE_LETTER_OPTION_C },
  { value: "D", label: NR_CARTE_LETTER_OPTION_D },
];

const CHIFFRE_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

function elementLabel(text: string, fallback: string): string {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export default function Bloc5CarteHistorique({ state, dispatch }: Bloc5Props) {
  useCarteHistoriquePayloadBootstrap();

  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p: CarteHistoriquePayload = useMemo(() => {
    const cid = isCarteHistoriqueComportementId(b.comportementId) ? b.comportementId : "2.1";
    const raw =
      state.bloc5.nonRedaction?.type === "carte-historique"
        ? state.bloc5.nonRedaction.payload
        : null;
    return normalizeCarteHistoriquePayload(raw) ?? initialCarteHistoriquePayload(cid);
  }, [state, b.comportementId]);

  const consigneOk = isCarteHistoriqueStep3Complete(p);
  const docsOk = isCarteHistoriqueDocumentsStepComplete(b.documentSlots, state.bloc4.documents);

  const patch = useCallback(
    (next: Partial<CarteHistoriquePayload>) => {
      dispatch({ type: "NON_REDACTION_PATCH_CARTE_HISTORIQUE", patch: next });
    },
    [dispatch],
  );

  if (!blueprintGate) {
    return <p className="text-sm leading-relaxed text-muted">{NR_CARTE_GATE_PRE_DOCS}</p>;
  }
  if (!consigneOk || !docsOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_CARTE_GATE_BLOC5}</p>;
  }

  if (p.comportementId === "2.1") {
    return <Bloc5_21 payload={p} onPatch={patch} />;
  }
  if (p.comportementId === "2.2") {
    return <Bloc5_22 payload={p} onPatch={patch} />;
  }
  return <Bloc5_23 payload={p} onPatch={patch} />;
}

/* -------------------------------------------------------------------------- */
/*  2.1 — radio simple A/B/C/D                                                 */
/* -------------------------------------------------------------------------- */

function Bloc5_21({
  payload,
  onPatch,
}: {
  payload: CarteHistoriquePayload;
  onPatch: (next: Partial<CarteHistoriquePayload>) => void;
}) {
  const titleId = useId();
  return (
    <div className="space-y-4">
      <div>
        <h3 id={titleId} className="text-sm font-semibold text-deep">
          {NR_CARTE_BLOC5_TITLE_21}
        </h3>
        <p className="mt-1 text-sm text-muted">{NR_CARTE_BLOC5_HELP_21}</p>
      </div>
      <SegmentedControl
        options={LETTER_OPTIONS}
        value={payload.correctLetter}
        onChange={(v) => onPatch({ correctLetter: v as CarteHistoriqueLetter })}
        aria-label={NR_CARTE_LETTER_GROUP_ARIA}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  2.2 — chiffres + génération + tableau A/B/C/D                              */
/* -------------------------------------------------------------------------- */

function Bloc5_22({
  payload,
  onPatch,
}: {
  payload: CarteHistoriquePayload;
  onPatch: (next: Partial<CarteHistoriquePayload>) => void;
}) {
  const titleId = useId();
  const chiffre1Id = useId();
  const chiffre2Id = useId();
  const element1 = elementLabel(payload.consigneElement1, "Élément 1");
  const element2 = elementLabel(payload.consigneElement2, "Élément 2");

  const handleGenerate = useCallback(() => {
    if (payload.correctChiffre1 === null || payload.correctChiffre2 === null) {
      toast.error(NR_CARTE_22_GEN_ERROR_INVALID);
      return;
    }
    if (payload.correctChiffre1 === payload.correctChiffre2) {
      toast.error(NR_CARTE_22_GEN_ERROR_SAME_DIGITS);
      return;
    }
    const result = generateCarteHistorique22Options([
      payload.correctChiffre1,
      payload.correctChiffre2,
    ] as CarteHistoriquePair);
    if (!result) {
      toast.error(NR_CARTE_22_GEN_ERROR_INVALID);
      return;
    }
    onPatch({
      optionA: result.optionA,
      optionB: result.optionB,
      optionC: result.optionC,
      optionD: result.optionD,
      correctLetter: result.correctLetter,
      generated22: true,
    });
  }, [onPatch, payload.correctChiffre1, payload.correctChiffre2]);

  const onChiffreChange = useCallback(
    (which: "correctChiffre1" | "correctChiffre2", v: string) => {
      const n = parseInt(v, 10);
      const chiffre = n === 1 || n === 2 || n === 3 || n === 4 ? n : null;
      onPatch({
        [which]: chiffre,
        // Toute modification après génération invalide le tableau
        optionA: null,
        optionB: null,
        optionC: null,
        optionD: null,
        correctLetter: "",
        generated22: false,
      });
    },
    [onPatch],
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 id={titleId} className="text-sm font-semibold text-deep">
          {NR_CARTE_BLOC5_TITLE_22}
        </h3>
        <p className="mt-1 text-sm text-muted">{NR_CARTE_BLOC5_HELP_22}</p>
      </div>

      <section className="space-y-3 rounded-md border border-border bg-panel p-4">
        <h4 className="text-sm font-semibold text-deep">{NR_CARTE_22_STEP1_TITLE}</h4>
        <p className="text-sm text-muted">{NR_CARTE_22_STEP1_DESCRIPTION}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={chiffre1Id} className="text-sm font-semibold text-deep">
              {NR_CARTE_22_CHIFFRE_LABEL_FOR.replace("{{element}}", element1)}
            </label>
            <ListboxField
              id={chiffre1Id}
              value={payload.correctChiffre1 == null ? "" : String(payload.correctChiffre1)}
              onChange={(v) => onChiffreChange("correctChiffre1", v)}
              allowEmpty
              placeholder={NR_CARTE_22_CHIFFRE_PLACEHOLDER}
              className="w-full max-w-40"
              options={CHIFFRE_OPTIONS}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={chiffre2Id} className="text-sm font-semibold text-deep">
              {NR_CARTE_22_CHIFFRE_LABEL_FOR.replace("{{element}}", element2)}
            </label>
            <ListboxField
              id={chiffre2Id}
              value={payload.correctChiffre2 == null ? "" : String(payload.correctChiffre2)}
              onChange={(v) => onChiffreChange("correctChiffre2", v)}
              allowEmpty
              placeholder={NR_CARTE_22_CHIFFRE_PLACEHOLDER}
              className="w-full max-w-40"
              options={CHIFFRE_OPTIONS}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            className={cn(
              "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white",
              "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            )}
          >
            {payload.generated22 ? NR_CARTE_22_REGENERATE_CTA : NR_CARTE_22_GENERATE_CTA}
          </button>
        </div>
      </section>

      {payload.generated22 &&
      payload.optionA &&
      payload.optionB &&
      payload.optionC &&
      payload.optionD ? (
        <section className="space-y-3 rounded-md border border-border bg-panel p-4">
          <h4 className="text-sm font-semibold text-deep">{NR_CARTE_22_STEP2_TITLE}</h4>
          <p className="text-sm text-muted">{NR_CARTE_22_STEP2_DESCRIPTION}</p>
          <div className="overflow-x-auto rounded-md border border-border">
            <table
              className="w-full min-w-[320px] border-collapse text-sm"
              role="grid"
              aria-label={NR_CARTE_22_TABLE_ARIA}
            >
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-2 py-2 text-left font-semibold text-deep">&#160;</th>
                  <th className="px-2 py-2 text-left font-semibold text-deep">{element1}</th>
                  <th className="px-2 py-2 text-left font-semibold text-deep">{element2}</th>
                  <th className="px-2 py-2 text-left font-semibold text-deep">&#160;</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const pair =
                    letter === "A"
                      ? payload.optionA
                      : letter === "B"
                        ? payload.optionB
                        : letter === "C"
                          ? payload.optionC
                          : payload.optionD;
                  const isCorrect = payload.correctLetter === letter;
                  return (
                    <tr
                      key={letter}
                      className={cn(
                        "border-b border-border last:border-b-0",
                        isCorrect ? "bg-success/10" : null,
                      )}
                    >
                      <th scope="row" className="px-2 py-2 text-left font-semibold text-deep">
                        {letter})
                      </th>
                      <td className="px-2 py-2 text-deep">{pair?.[0] ?? "—"}</td>
                      <td className="px-2 py-2 text-deep">{pair?.[1] ?? "—"}</td>
                      <td className="px-2 py-2 text-xs">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">
                            <span className="material-symbols-outlined text-[1em]" aria-hidden>
                              check_circle
                            </span>
                            {NR_CARTE_22_CORRECT_BADGE}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  2.3 — deux radios A/B/C/D (un par lieu)                                    */
/* -------------------------------------------------------------------------- */

function Bloc5_23({
  payload,
  onPatch,
}: {
  payload: CarteHistoriquePayload;
  onPatch: (next: Partial<CarteHistoriquePayload>) => void;
}) {
  const titleId = useId();
  const element1 = elementLabel(payload.consigneElement1, "Lieu 1");
  const element2 = elementLabel(payload.consigneElement2, "Lieu 2");

  return (
    <div className="space-y-5">
      <div>
        <h3 id={titleId} className="text-sm font-semibold text-deep">
          {NR_CARTE_BLOC5_TITLE_23}
        </h3>
        <p className="mt-1 text-sm text-muted">{NR_CARTE_BLOC5_HELP_23}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-deep">
          {NR_CARTE_23_LETTER_LABEL_FOR.replace("{{element}}", element1)}
        </p>
        <SegmentedControl
          options={LETTER_OPTIONS}
          value={payload.correctLetter1}
          onChange={(v) => onPatch({ correctLetter1: v as CarteHistoriqueLetter })}
          aria-label={NR_CARTE_LETTER_GROUP_ARIA_FOR.replace("{{element}}", element1)}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-deep">
          {NR_CARTE_23_LETTER_LABEL_FOR.replace("{{element}}", element2)}
        </p>
        <SegmentedControl
          options={LETTER_OPTIONS}
          value={payload.correctLetter2}
          onChange={(v) => onPatch({ correctLetter2: v as CarteHistoriqueLetter })}
          aria-label={NR_CARTE_LETTER_GROUP_ARIA_FOR.replace("{{element}}", element2)}
        />
      </div>
    </div>
  );
}
