"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MillerConnaissancesHec, MillerConnaissancesHqc } from "@/components/tae/TaeForm/bloc7";
import { SectionAspects } from "@/components/tae/TaeForm/bloc7/SectionAspects";
import { SimpleModal } from "@/components/ui/SimpleModal";
import {
  BLOC3_MODAL_ASPECTS_BODY,
  BLOC3_MODAL_ASPECTS_TITLE,
} from "@/components/tae/TaeForm/bloc3/modalCopy";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import type { DisciplineCode, NiveauCode } from "@/lib/tae/blueprint-helpers";
import { isConnaissancesStepGateOk } from "@/lib/tae/connaissances-step-guards";
import {
  connDataUrlForDiscipline,
  filterConnRowsByNiveau,
  parseConnJsonArray,
  type ConnRawRow,
  type ConnaissanceSelectionWithIds,
  type HecConnRow,
  type HqcConnRow,
} from "@/lib/tae/connaissances-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import {
  BLOC7_CONNAISSANCES_HELP,
  BLOC7_CONNAISSANCES_LABEL,
  BLOC7_GATE,
  WIZARD_CONNAISSANCES_EMPTY_FILTER,
  WIZARD_REFERENTIEL_CONN_INDISPO,
  WIZARD_REFERENTIEL_LOAD_FAILED,
} from "@/lib/ui/ui-copy";
import { RequiredMark } from "@/components/ui/RequiredMark";

/**
 * Étape 7 — Aspects de société + connaissances relatives — docs/WORKFLOWS.md
 */
export function Bloc7AspectsConnaissances() {
  const { state, dispatch } = useTaeForm();
  const discipline = state.bloc2.discipline as DisciplineCode;
  const niveau = state.bloc2.niveau as NiveauCode;
  const [rows, setRows] = useState<ConnRawRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [modalAspects, setModalAspects] = useState(false);
  /** Incrémenté au « Réinitialiser » pour remonter les Miller (état local réinitialisé). */
  const [millerResetKey, setMillerResetKey] = useState(0);

  const gateOk = isConnaissancesStepGateOk(state);
  const aspects = state.bloc7.aspects;

  const selectedIds = useMemo(
    () => new Set(state.bloc7.connaissances.map((c) => c.rowId)),
    [state.bloc7.connaissances],
  );

  const syncNavigationRowId = state.bloc7.connaissances[0]?.rowId ?? null;

  const onToggle = (sel: ConnaissanceSelectionWithIds) => {
    dispatch({ type: "TOGGLE_CONNAISSANCE", selection: sel });
  };

  const toggleAspect = useCallback(
    (aspect: AspectSocieteKey) => {
      dispatch({
        type: "SET_ASPECT",
        aspect,
        value: !aspects[aspect],
      });
    },
    [dispatch, aspects],
  );

  const dataUrl = connDataUrlForDiscipline(discipline);

  useEffect(() => {
    if (!dataUrl) return;
    let cancelled = false;
    fetch(dataUrl)
      .then((r) => {
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        setLoadError(false);
        const parsed = parseConnJsonArray(raw, discipline);
        setRows(filterConnRowsByNiveau(parsed, niveau));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [dataUrl, discipline, niveau]);

  if (!gateOk) {
    return <p className="text-sm leading-relaxed text-muted">{BLOC7_GATE}</p>;
  }

  const handleResetConnaissances = () => {
    dispatch({ type: "CLEAR_CONNAISSANCES" });
    setMillerResetKey((k) => k + 1);
  };

  const connaissancesBlock = () => {
    if (discipline === "geo") {
      return (
        <p className="text-sm leading-relaxed text-muted">{WIZARD_REFERENTIEL_CONN_INDISPO}</p>
      );
    }

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

    if (discipline === "hec") {
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
  };

  return (
    <div className="space-y-6">
      <SimpleModal
        open={modalAspects}
        title={BLOC3_MODAL_ASPECTS_TITLE}
        onClose={() => setModalAspects(false)}
        titleStyle="info-help"
      >
        <p className="text-sm leading-relaxed text-deep">{BLOC3_MODAL_ASPECTS_BODY}</p>
      </SimpleModal>

      <SectionAspects
        aspects={aspects}
        onToggle={toggleAspect}
        onInfoClick={() => setModalAspects(true)}
      />

      <section className="space-y-2 border-t border-border pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined text-[1em] text-accent"
            aria-hidden="true"
            title={materialIconTooltip("lightbulb") ?? undefined}
          >
            lightbulb
          </span>
          <span>
            {BLOC7_CONNAISSANCES_LABEL} <RequiredMark />
          </span>
        </div>
        <p className="text-xs text-muted">{BLOC7_CONNAISSANCES_HELP}</p>
        {connaissancesBlock()}
      </section>
    </div>
  );
}
