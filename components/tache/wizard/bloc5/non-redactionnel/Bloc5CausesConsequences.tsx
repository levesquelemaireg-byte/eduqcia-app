"use client";

/**
 * Bloc 5 — causes-consequences (OI4, comportements 4.3 / 4.4).
 *
 * Étape de corrigé : l'enseignant assigne manuellement chaque document à son
 * rôle causal. Toujours 2 documents et 2 catégories (dérivées du comportement),
 * un seul `ListboxField` par catégorie. Validation produit : l'option déjà
 * assignée à l'autre catégorie est `disabled` — impossible de créer un
 * doublon par UI.
 */

import { useCallback, useId, useMemo } from "react";
import { useCausesConsequencesPayloadBootstrap } from "@/components/tache/non-redaction/causes-consequences/useCausesConsequencesPayloadBootstrap";
import { ListboxField } from "@/components/ui/ListboxField";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  getCausesConsequencesCategoryLabels,
  initialCausesConsequencesPayload,
  isCausesConsequencesComportementId,
  isCausesConsequencesDocumentsStepComplete,
  isCausesConsequencesStep3Complete,
  normalizeCausesConsequencesPayload,
  type CausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";
import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";
import {
  NR_CAUSES_CONSEQUENCES_BLOC5_DOC_PICKER_ARIA_PREFIX,
  NR_CAUSES_CONSEQUENCES_BLOC5_DOC_PLACEHOLDER,
  NR_CAUSES_CONSEQUENCES_BLOC5_HELP,
  NR_CAUSES_CONSEQUENCES_BLOC5_TITLE,
  NR_CAUSES_CONSEQUENCES_GATE_BLOC5,
} from "@/lib/ui/ui-copy";

export default function Bloc5CausesConsequences({ state, dispatch }: Bloc5Props) {
  useCausesConsequencesPayloadBootstrap();

  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p: CausesConsequencesPayload = useMemo(() => {
    const cid = isCausesConsequencesComportementId(b.comportementId) ? b.comportementId : "4.3";
    const nr = state.bloc5.nonRedaction;
    const raw = nr?.type === "causes-consequences" ? nr.payload : null;
    return normalizeCausesConsequencesPayload(raw) ?? initialCausesConsequencesPayload(cid);
  }, [state.bloc5.nonRedaction, b.comportementId]);

  const bloc3Ok = isCausesConsequencesStep3Complete(p);
  const bloc4Ok = isCausesConsequencesDocumentsStepComplete(b.documentSlots, state.bloc4.documents);

  const labels = useMemo(
    () => getCausesConsequencesCategoryLabels(p.comportementId, p.consigneSujet),
    [p.comportementId, p.consigneSujet],
  );

  const onAssignmentChange = useCallback(
    (categoryIndex: 0 | 1, docNumber: number | null) => {
      const next: [number | null, number | null] = [...p.associations] as [
        number | null,
        number | null,
      ];
      next[categoryIndex] = docNumber;
      dispatch({
        type: "NON_REDACTION_PATCH_CAUSES_CONSEQUENCES",
        patch: { associations: next },
      });
    },
    [dispatch, p.associations],
  );

  if (!blueprintGate || !bloc3Ok || !bloc4Ok) {
    return (
      <p className="text-sm leading-relaxed text-muted">{NR_CAUSES_CONSEQUENCES_GATE_BLOC5}</p>
    );
  }

  const allDocNumbers = [1, 2];

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <h3 className="text-sm font-semibold text-deep">{NR_CAUSES_CONSEQUENCES_BLOC5_TITLE}</h3>
        <p className="text-xs leading-relaxed text-muted">{NR_CAUSES_CONSEQUENCES_BLOC5_HELP}</p>
      </header>

      <div className="space-y-4">
        {labels.map((label, categoryIndex) => (
          <CategoryAssignmentRow
            key={categoryIndex}
            categoryIndex={categoryIndex as 0 | 1}
            categoryLabel={label}
            currentValue={p.associations[categoryIndex] ?? null}
            otherValue={p.associations[categoryIndex === 0 ? 1 : 0] ?? null}
            allDocNumbers={allDocNumbers}
            onChange={onAssignmentChange}
          />
        ))}
      </div>

      <p className="text-xs leading-relaxed text-muted" role="note">
        Total attendu : 2 documents assignés sur 2 rôles distincts.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CategoryAssignmentRow                                                      */
/* -------------------------------------------------------------------------- */

function CategoryAssignmentRow({
  categoryIndex,
  categoryLabel,
  currentValue,
  otherValue,
  allDocNumbers,
  onChange,
}: {
  categoryIndex: 0 | 1;
  categoryLabel: string;
  currentValue: number | null;
  otherValue: number | null;
  allDocNumbers: number[];
  onChange: (categoryIndex: 0 | 1, docNumber: number | null) => void;
}) {
  const id = useId();

  // Le numéro déjà assigné à l'autre catégorie est disabled (sauf si c'est aussi la valeur courante).
  const options = allDocNumbers.map((n) => ({
    value: String(n),
    label: `Document ${n}`,
    disabled: otherValue === n && n !== currentValue,
  }));

  const handleChange = (value: string) => {
    if (value === "") {
      onChange(categoryIndex, null);
      return;
    }
    const num = Number(value);
    if (!Number.isInteger(num)) return;
    onChange(categoryIndex, num);
  };

  const ariaLabel = `${NR_CAUSES_CONSEQUENCES_BLOC5_DOC_PICKER_ARIA_PREFIX}${categoryIndex + 1}`;

  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          {categoryIndex + 1}
        </span>
        <label htmlFor={id} className="text-sm font-semibold text-deep">
          {categoryLabel}
        </label>
      </div>
      <ListboxField
        id={id}
        value={currentValue !== null ? String(currentValue) : ""}
        onChange={handleChange}
        options={options}
        placeholder={NR_CAUSES_CONSEQUENCES_BLOC5_DOC_PLACEHOLDER}
        className="w-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}
