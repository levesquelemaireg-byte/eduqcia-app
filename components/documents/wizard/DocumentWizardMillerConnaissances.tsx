"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { MillerConnaissancesHec, MillerConnaissancesHqc } from "@/components/tae/TaeForm/bloc7";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DisciplineCode, NiveauCode } from "@/lib/tae/blueprint-helpers";
import {
  connDataUrlForDiscipline,
  filterConnRowsByNiveau,
  parseConnJsonArray,
  type ConnRawRow,
  type ConnaissanceSelectionWithIds,
  type HecConnRow,
  type HqcConnRow,
} from "@/lib/tae/connaissances-helpers";
import {
  WIZARD_CONNAISSANCES_EMPTY_FILTER,
  WIZARD_REFERENTIEL_CONN_INDISPO,
  WIZARD_REFERENTIEL_LOAD_FAILED,
} from "@/lib/ui/ui-copy";

type Props = {
  niveauCode: NiveauCode | "";
  disciplineCode: DisciplineCode | "";
};

type LoadedProps = {
  niveauCode: NiveauCode;
  disciplineCode: "hec" | "hqc";
  selectedIds: Set<string>;
  syncNavigationRowId: string | null;
  onToggle: (sel: ConnaissanceSelectionWithIds) => void;
  onReset: () => void;
};

/**
 * Fetch + rendu Miller — monté seulement pour HEC/HQC avec niveau valide (pas de `setState` synchrone au début d’un effet).
 */
function DocumentWizardMillerConnaissancesLoaded({
  niveauCode,
  disciplineCode,
  selectedIds,
  syncNavigationRowId,
  onToggle,
  onReset,
}: LoadedProps) {
  const [rows, setRows] = useState<ConnRawRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [millerResetKey, setMillerResetKey] = useState(0);

  useEffect(() => {
    const url = connDataUrlForDiscipline(disciplineCode);
    if (!url) return;
    let cancelled = false;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        setLoadError(false);
        const parsed = parseConnJsonArray(raw, disciplineCode);
        setRows(filterConnRowsByNiveau(parsed, niveauCode));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [disciplineCode, niveauCode]);

  const handleResetConnaissances = () => {
    onReset();
    setMillerResetKey((k) => k + 1);
  };

  if (loadError) {
    return (
      <p className="text-sm text-error" role="alert">
        {WIZARD_REFERENTIEL_LOAD_FAILED}
      </p>
    );
  }

  if (rows === null) {
    return <div className="h-40 animate-pulse rounded-xl bg-border/30" aria-hidden="true" />;
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted" role="status">
        {WIZARD_CONNAISSANCES_EMPTY_FILTER}
      </p>
    );
  }

  if (disciplineCode === "hec") {
    return (
      <MillerConnaissancesHec
        key={millerResetKey}
        rows={rows as HecConnRow[]}
        selectedIds={selectedIds}
        syncNavigationRowId={syncNavigationRowId}
        onToggle={onToggle}
        onReset={handleResetConnaissances}
      />
    );
  }

  return (
    <MillerConnaissancesHqc
      key={millerResetKey}
      rows={rows as HqcConnRow[]}
      selectedIds={selectedIds}
      syncNavigationRowId={syncNavigationRowId}
      onToggle={onToggle}
      onReset={handleResetConnaissances}
    />
  );
}

/**
 * Colonnes Miller — même module que l’étape 7 du wizard « Créer une tâche » (`Bloc7AspectsConnaissances`).
 */
export function DocumentWizardMillerConnaissances({ niveauCode, disciplineCode }: Props) {
  const { setValue } = useFormContext<AutonomousDocumentFormValues>();
  const selections = useWatch({
    name: "connaissances_miller",
    defaultValue: [] as ConnaissanceSelectionWithIds[],
  }) as ConnaissanceSelectionWithIds[];

  const selectedIds = useMemo(() => new Set(selections.map((c) => c.rowId)), [selections]);

  const syncNavigationRowId = selections[0]?.rowId ?? null;

  const onToggle = (sel: ConnaissanceSelectionWithIds) => {
    const exists = selections.some((c) => c.rowId === sel.rowId);
    const next = exists ? selections.filter((c) => c.rowId !== sel.rowId) : [...selections, sel];
    setValue("connaissances_miller", next, { shouldValidate: true, shouldDirty: true });
  };

  const onReset = () => {
    setValue("connaissances_miller", [], { shouldValidate: true, shouldDirty: true });
  };

  if (!niveauCode || !disciplineCode) {
    return (
      <p className="text-sm leading-relaxed text-muted" role="status">
        Sélectionnez d&apos;abord un niveau et une discipline.
      </p>
    );
  }

  if (disciplineCode === "geo") {
    return <p className="text-sm leading-relaxed text-muted">{WIZARD_REFERENTIEL_CONN_INDISPO}</p>;
  }

  return (
    <DocumentWizardMillerConnaissancesLoaded
      niveauCode={niveauCode}
      disciplineCode={disciplineCode}
      selectedIds={selectedIds}
      syncNavigationRowId={syncNavigationRowId}
      onToggle={onToggle}
      onReset={onReset}
    />
  );
}
