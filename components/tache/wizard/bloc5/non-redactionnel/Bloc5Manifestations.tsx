"use client";

/**
 * Bloc 5 — manifestations (OI5, comportements 5.1 / 5.2).
 *
 * Étape de corrigé : l'enseignant assigne manuellement chaque document à
 * sa catégorie. Validation produit (option a) : les options déjà assignées
 * ailleurs sont disabled dans les autres pickers — impossible de créer un
 * doublon par UI.
 *
 * Layouts :
 * - 5.1 : 2 catégories × 1 ListboxField chaque
 * - 5.2 + 2-categories : 2 catégories × 2 ListboxField chaque
 * - 5.2 + 4-categories : 4 catégories × 1 ListboxField chaque
 */

import { useCallback, useId, useMemo } from "react";
import { useManifestationsPayloadBootstrap } from "@/components/tache/non-redaction/manifestations/useManifestationsPayloadBootstrap";
import { ListboxField } from "@/components/ui/ListboxField";
import { isBlueprintFieldsComplete } from "@/lib/tache/blueprint-helpers";
import {
  getCategoryCount,
  getDocsPerCategory,
  getTotalDocumentCount,
} from "@/lib/tache/non-redaction/manifestations-helpers";
import {
  initialManifestationsPayload,
  isManifestationsComportementId,
  isManifestationsDocumentsStepComplete,
  isManifestationsStep3Complete,
  normalizeManifestationsPayload,
  type ManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import type { Bloc5Props } from "@/lib/tache/tache-form-state-types";
import {
  NR_MANIFESTATIONS_BLOC5_DOC_LABEL_PREFIX,
  NR_MANIFESTATIONS_BLOC5_DOC_PICKER_ARIA_PREFIX,
  NR_MANIFESTATIONS_BLOC5_DOC_PLACEHOLDER,
  NR_MANIFESTATIONS_BLOC5_HELP,
  NR_MANIFESTATIONS_BLOC5_TITLE,
  NR_MANIFESTATIONS_GATE_BLOC5,
} from "@/lib/ui/ui-copy";

export default function Bloc5Manifestations({ state, dispatch }: Bloc5Props) {
  useManifestationsPayloadBootstrap();

  const b = state.bloc2;
  const blueprintGate = isBlueprintFieldsComplete(b) && b.blueprintLocked;

  const p: ManifestationsPayload = useMemo(() => {
    const cid = isManifestationsComportementId(b.comportementId) ? b.comportementId : "5.1";
    const nr = state.bloc5.nonRedaction;
    const raw = nr?.type === "manifestations" ? nr.payload : null;
    return normalizeManifestationsPayload(raw) ?? initialManifestationsPayload(cid);
  }, [state.bloc5.nonRedaction, b.comportementId]);

  const bloc3Ok = isManifestationsStep3Complete(p);
  const bloc4Ok = isManifestationsDocumentsStepComplete(b.documentSlots, state.bloc4.documents);

  const categoryCount = getCategoryCount(p.comportementId, p.organisationCategories);
  const docsPerCategory = getDocsPerCategory(p.comportementId, p.organisationCategories);
  const totalDocs = getTotalDocumentCount(p.comportementId);

  const onAssignmentChange = useCallback(
    (categoryIndex: number, docIndex: number, docNumber: number | null) => {
      const updated = p.associations.map((cat, i) =>
        i === categoryIndex ? [...cat] : cat,
      ) as number[][];
      const slot = updated[categoryIndex] ?? [];
      const next = [...slot];
      if (docNumber === null) {
        next.splice(docIndex, 1);
      } else {
        next[docIndex] = docNumber;
      }
      updated[categoryIndex] = next.filter((n): n is number => Number.isInteger(n));
      dispatch({
        type: "NON_REDACTION_PATCH_MANIFESTATIONS",
        patch: { associations: updated },
      });
    },
    [dispatch, p.associations],
  );

  if (!blueprintGate || !bloc3Ok || !bloc4Ok) {
    return <p className="text-sm leading-relaxed text-muted">{NR_MANIFESTATIONS_GATE_BLOC5}</p>;
  }

  const allDocNumbers = Array.from({ length: totalDocs }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <h3 className="text-sm font-semibold text-deep">{NR_MANIFESTATIONS_BLOC5_TITLE}</h3>
        <p className="text-xs leading-relaxed text-muted">{NR_MANIFESTATIONS_BLOC5_HELP}</p>
      </header>

      <div className="space-y-4">
        {p.categories.map((categoryLabel, categoryIndex) => (
          <CategoryAssignmentRow
            key={categoryIndex}
            categoryIndex={categoryIndex}
            categoryLabel={categoryLabel.trim() || `Catégorie ${categoryIndex + 1}`}
            assignment={p.associations[categoryIndex] ?? []}
            allDocNumbers={allDocNumbers}
            allAssignments={p.associations}
            docsPerCategory={docsPerCategory}
            onChange={onAssignmentChange}
          />
        ))}
      </div>

      <p className="text-xs leading-relaxed text-muted" role="note">
        Total attendu : {totalDocs} document{totalDocs > 1 ? "s" : ""} assigné
        {totalDocs > 1 ? "s" : ""} sur {categoryCount} catégorie
        {categoryCount > 1 ? "s" : ""} × {docsPerCategory} document
        {docsPerCategory > 1 ? "s" : ""} par catégorie.
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
  assignment,
  allDocNumbers,
  allAssignments,
  docsPerCategory,
  onChange,
}: {
  categoryIndex: number;
  categoryLabel: string;
  assignment: number[];
  allDocNumbers: number[];
  allAssignments: number[][];
  docsPerCategory: number;
  onChange: (categoryIndex: number, docIndex: number, docNumber: number | null) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          {categoryIndex + 1}
        </span>
        <span className="text-sm font-semibold text-deep">{categoryLabel}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: docsPerCategory }, (_, docIndex) => (
          <DocPicker
            key={docIndex}
            categoryIndex={categoryIndex}
            docIndex={docIndex}
            currentValue={assignment[docIndex] ?? null}
            allDocNumbers={allDocNumbers}
            allAssignments={allAssignments}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DocPicker — ListboxField avec options déjà assignées disabled              */
/* -------------------------------------------------------------------------- */

function DocPicker({
  categoryIndex,
  docIndex,
  currentValue,
  allDocNumbers,
  allAssignments,
  onChange,
}: {
  categoryIndex: number;
  docIndex: number;
  currentValue: number | null;
  allDocNumbers: number[];
  allAssignments: number[][];
  onChange: (categoryIndex: number, docIndex: number, docNumber: number | null) => void;
}) {
  const id = useId();

  // Numéros déjà assignés ailleurs (autre catégorie, ou même catégorie autre slot).
  const disabledSet = useMemo(() => {
    const used = new Set<number>();
    for (let ci = 0; ci < allAssignments.length; ci++) {
      const cat = allAssignments[ci] ?? [];
      for (let di = 0; di < cat.length; di++) {
        if (ci === categoryIndex && di === docIndex) continue;
        const n = cat[di];
        if (Number.isInteger(n)) used.add(n as number);
      }
    }
    return used;
  }, [allAssignments, categoryIndex, docIndex]);

  const options = allDocNumbers.map((n) => ({
    value: String(n),
    label: `Document ${n}`,
    disabled: disabledSet.has(n) && n !== currentValue,
  }));

  const handleChange = (value: string) => {
    if (value === "") {
      onChange(categoryIndex, docIndex, null);
      return;
    }
    const num = Number(value);
    if (!Number.isInteger(num)) return;
    onChange(categoryIndex, docIndex, num);
  };

  const labelText = `${NR_MANIFESTATIONS_BLOC5_DOC_LABEL_PREFIX}${docIndex + 1}`;
  const ariaLabel = `${NR_MANIFESTATIONS_BLOC5_DOC_PICKER_ARIA_PREFIX}${categoryIndex + 1}, emplacement ${docIndex + 1}`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-deep">
        {labelText}
      </label>
      <ListboxField
        id={id}
        value={currentValue !== null ? String(currentValue) : ""}
        onChange={handleChange}
        options={options}
        placeholder={NR_MANIFESTATIONS_BLOC5_DOC_PLACEHOLDER}
        className="w-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}
