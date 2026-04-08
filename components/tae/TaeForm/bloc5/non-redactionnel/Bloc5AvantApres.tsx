"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { useAvantApresPayloadBootstrap } from "@/components/tae/non-redaction/avant-apres/useAvantApresPayloadBootstrap";
import { isBlueprintFieldsComplete } from "@/lib/tae/blueprint-helpers";
import { getAnneePourComparaison } from "@/lib/tae/document-annee";
import { getSlotData, slotLetter } from "@/lib/tae/document-helpers";
import {
  avantApresDocYearNeedsOverride,
  clearedAvantApresOptionsPatch,
  formatAvantApresAnneeForDisplay,
  initialAvantApresPayload,
  isAvantApresDocumentsStepComplete,
  isAvantApresRedactionStepCompleteForNext,
  normalizeAvantApresPayload,
  runAvantApresGeneration,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import type { AvantApresPayload } from "@/lib/tae/non-redaction/avant-apres-payload";
import type { Bloc5Props } from "@/lib/tae/tae-form-state-types";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  NR_AVANT_APRES_BLOC5_HELP,
  NR_AVANT_APRES_BLOC5_TITLE,
  NR_AVANT_APRES_GATE_BLOC5,
  NR_AVANT_APRES_GATE_PRE_DOCS,
  NR_AVANT_APRES_GEN_ERROR_MISSING_YEAR,
  NR_AVANT_APRES_GEN_ERROR_PARTITION,
  NR_AVANT_APRES_GEN_ERROR_TIE,
  NR_AVANT_APRES_GENERATE_CTA,
  NR_AVANT_APRES_OVERRIDE_APRES,
  NR_AVANT_APRES_OVERRIDE_AVANT,
  NR_AVANT_APRES_OVERRIDE_SECTION_HELP,
  NR_AVANT_APRES_OVERRIDE_SECTION_TITLE,
  NR_AVANT_APRES_OVERRIDE_SLOT_LABEL,
  NR_AVANT_APRES_REGENERATE_CTA,
  NR_AVANT_APRES_TABLE_COL_APRES,
  NR_AVANT_APRES_TABLE_COL_AVANT,
  NR_AVANT_APRES_TABLE_COL_REPERE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";
import { nonRedactionAvantApresPayload } from "@/lib/tae/wizard-state-nr";

function sortDocSlotPair(a: DocumentSlotId, b: DocumentSlotId): [DocumentSlotId, DocumentSlotId] {
  return a < b ? [a, b] : [b, a];
}

function formatDocPairLabel(slots: [DocumentSlotId, DocumentSlotId]): string {
  const [x, y] = sortDocSlotPair(slots[0], slots[1]);
  return `${slotLetter(x)} et ${slotLetter(y)}`;
}

function toastForGenerationError(code: string): void {
  if (code === "missing_year") toast.error(NR_AVANT_APRES_GEN_ERROR_MISSING_YEAR);
  else if (code === "tie_without_override") toast.error(NR_AVANT_APRES_GEN_ERROR_TIE);
  else toast.error(NR_AVANT_APRES_GEN_ERROR_PARTITION);
}

export default function Bloc5AvantApres({ state, dispatch }: Bloc5Props) {
  useAvantApresPayloadBootstrap();

  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p = useMemo(() => {
    return (
      normalizeAvantApresPayload(nonRedactionAvantApresPayload(state)) ?? initialAvantApresPayload()
    );
  }, [state]);

  const orderedSlotIds = useMemo(
    () => b.documentSlots.map((s) => s.slotId) as DocumentSlotId[],
    [b.documentSlots],
  );

  const consigneOk = isAvantApresRedactionStepCompleteForNext(p);
  const docsOk = isAvantApresDocumentsStepComplete(b.documentSlots, state.bloc4.documents);

  const applyPatch = useCallback(
    (partial: Partial<AvantApresPayload>) => {
      const clear = p.generated ? clearedAvantApresOptionsPatch() : {};
      dispatch({
        type: "NON_REDACTION_PATCH_AVANT_APRES",
        patch: { ...clear, ...partial },
      });
    },
    [dispatch, p.generated],
  );

  const handleGenerate = useCallback(() => {
    const { payload, errorCode } = runAvantApresGeneration(
      p,
      orderedSlotIds,
      state.bloc4.documents,
    );
    dispatch({ type: "NON_REDACTION_PATCH_AVANT_APRES", patch: payload });
    if (errorCode) toastForGenerationError(errorCode);
  }, [dispatch, orderedSlotIds, p, state.bloc4.documents]);

  if (!blueprintGate) {
    return <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_GATE_PRE_DOCS}</p>;
  }
  if (!consigneOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_GATE_BLOC5}</p>;
  }
  if (!docsOk) {
    return <p className="text-sm leading-relaxed text-muted">{NR_AVANT_APRES_GATE_BLOC5}</p>;
  }

  const tieSlots = orderedSlotIds.filter((slotId) => {
    const y = getAnneePourComparaison(getSlotData(state.bloc4.documents, slotId));
    return y !== null && avantApresDocYearNeedsOverride(y, p);
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-deep">{NR_AVANT_APRES_BLOC5_TITLE}</h3>
        <p className="mt-1 text-sm text-muted">{NR_AVANT_APRES_BLOC5_HELP}</p>
      </div>

      {tieSlots.length > 0 ? (
        <section className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
          <h4 className="text-sm font-semibold text-deep">
            {NR_AVANT_APRES_OVERRIDE_SECTION_TITLE}
          </h4>
          <p className="text-sm text-muted">{NR_AVANT_APRES_OVERRIDE_SECTION_HELP}</p>
          <ul className="space-y-3">
            {tieSlots.map((slotId) => {
              const letter = slotLetter(slotId);
              const label = NR_AVANT_APRES_OVERRIDE_SLOT_LABEL.replace("{{letter}}", letter);
              const val = p.overrides[slotId] ?? "";
              return (
                <li
                  key={slotId}
                  className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="text-sm font-medium text-deep">{label}</span>
                  <SegmentedControl
                    aria-label={label}
                    className="min-w-0 sm:max-w-xl"
                    options={[
                      { value: "", label: "—" },
                      { value: "avant", label: NR_AVANT_APRES_OVERRIDE_AVANT },
                      { value: "apres", label: NR_AVANT_APRES_OVERRIDE_APRES },
                    ]}
                    value={val === "avant" || val === "apres" ? val : ""}
                    onChange={(v) => {
                      const next = { ...p.overrides };
                      if (v === "avant" || v === "apres") next[slotId] = v;
                      else delete next[slotId];
                      applyPatch({ overrides: next });
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={cn(
            "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
            "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          onClick={handleGenerate}
        >
          {p.generated ? NR_AVANT_APRES_REGENERATE_CTA : NR_AVANT_APRES_GENERATE_CTA}
        </button>
      </div>

      {p.generated && p.optionRows.length === 4 ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-2 py-2 text-left font-semibold text-deep">&#160;</th>
                <th className="px-2 py-2 text-left font-semibold text-deep">
                  {NR_AVANT_APRES_TABLE_COL_AVANT}
                </th>
                <th className="px-2 py-2 text-left font-semibold text-deep">
                  {NR_AVANT_APRES_TABLE_COL_REPERE}
                </th>
                <th className="px-2 py-2 text-left font-semibold text-deep">
                  {NR_AVANT_APRES_TABLE_COL_APRES}
                </th>
              </tr>
            </thead>
            <tbody>
              {p.optionRows.map((row, idx) => {
                const repCell =
                  idx === 0 ? (
                    <td
                      rowSpan={4}
                      className="border-l border-border px-2 py-2 align-middle text-deep"
                    >
                      {p.repere.trim()} ({formatAvantApresAnneeForDisplay(p)})
                    </td>
                  ) : null;
                return (
                  <tr key={row.letter} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-2 py-2 text-left font-semibold text-deep">
                      {row.letter})
                    </th>
                    <td className="px-2 py-2 text-deep">{formatDocPairLabel(row.avantSlots)}</td>
                    {repCell}
                    <td className="px-2 py-2 text-deep">{formatDocPairLabel(row.apresSlots)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
