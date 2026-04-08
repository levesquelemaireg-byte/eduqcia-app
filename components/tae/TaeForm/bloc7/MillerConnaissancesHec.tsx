"use client";

import { useMemo, useState } from "react";
import {
  hecBranchNeedsSousColumn,
  hecRowToSelection,
  uniqueInOrder,
  type ConnaissanceSelectionWithIds,
  type HecConnRow,
} from "@/lib/tae/connaissances-helpers";
import { cn } from "@/lib/utils/cn";
import { MILLER_CHOICE_BTN_WRAP, MILLER_COLUMN_LIST_CLASSNAME } from "@/lib/ui/miller-columns";
import { MillerColumnHead } from "@/components/tae/TaeForm/bloc7/MillerColumnHead";
import { encSous, SOUS_NULL } from "@/components/tae/TaeForm/bloc7/millerConnaissancesEnc";

type Props = {
  rows: HecConnRow[];
  selectedIds: Set<string>;
  onToggle: (row: ConnaissanceSelectionWithIds) => void;
  /** Réhydratation : aligne les colonnes sur la première connaissance sélectionnée. */
  syncNavigationRowId?: string | null;
};

function initialHecRealite(rows: HecConnRow[], syncId: string | null): string | null {
  if (syncId) {
    const r = rows.find((x) => x.id === syncId);
    if (r) return r.realite_sociale;
  }
  return rows[0]?.realite_sociale ?? null;
}

function initialHecSection(rows: HecConnRow[], syncId: string | null): string | null {
  if (!syncId) return null;
  const r = rows.find((x) => x.id === syncId);
  return r?.section ?? null;
}

function initialHecSousPick(rows: HecConnRow[], syncId: string | null): string | null {
  if (!syncId) return null;
  const r = rows.find((x) => x.id === syncId);
  if (!r) return null;
  if (!hecBranchNeedsSousColumn(rows, r.realite_sociale, r.section)) return null;
  return encSous(r.sous_section);
}

export function MillerConnaissancesHec({
  rows,
  selectedIds,
  onToggle,
  syncNavigationRowId = null,
}: Props) {
  const syncId = syncNavigationRowId ?? null;
  const [realite, setRealite] = useState<string | null>(() => initialHecRealite(rows, syncId));
  const [section, setSection] = useState<string | null>(() => initialHecSection(rows, syncId));
  const [userSousPick, setUserSousPick] = useState<string | null>(() =>
    initialHecSousPick(rows, syncId),
  );

  const realites = useMemo(() => uniqueInOrder(rows.map((r) => r.realite_sociale)), [rows]);

  const sections = useMemo(() => {
    if (!realite) return [];
    return uniqueInOrder(rows.filter((r) => r.realite_sociale === realite).map((r) => r.section));
  }, [rows, realite]);

  const needsSousSectionColumn = useMemo(() => {
    if (!realite || !section) return false;
    return hecBranchNeedsSousColumn(rows, realite, section);
  }, [rows, realite, section]);

  const sousKeys = useMemo(() => {
    if (!realite || !section || !needsSousSectionColumn) return [];
    return uniqueInOrder(
      rows
        .filter((r) => r.realite_sociale === realite && r.section === section)
        .map((r) => encSous(r.sous_section)),
    );
  }, [rows, realite, section, needsSousSectionColumn]);

  const autoResolvedSousKey = useMemo(() => {
    if (!needsSousSectionColumn || !realite || !section) return null;
    if (sousKeys.length === 0) return null;
    if (sousKeys.length === 1) return sousKeys[0]!;
    return null;
  }, [needsSousSectionColumn, realite, section, sousKeys]);

  const sousKey = useMemo(() => {
    if (autoResolvedSousKey !== null) return autoResolvedSousKey;
    if (userSousPick !== null && sousKeys.includes(userSousPick)) return userSousPick;
    return null;
  }, [autoResolvedSousKey, userSousPick, sousKeys]);

  const enoncesRows = useMemo(() => {
    if (!realite || !section) return [];
    if (!needsSousSectionColumn) {
      return rows.filter((r) => r.realite_sociale === realite && r.section === section);
    }
    if (sousKey === null) return [];
    const sk = sousKey === SOUS_NULL ? null : sousKey;
    return rows.filter(
      (r) =>
        r.realite_sociale === realite &&
        r.section === section &&
        (r.sous_section === null ? SOUS_NULL : r.sous_section) === encSous(sk),
    );
  }, [rows, realite, section, needsSousSectionColumn, sousKey]);

  const showEnonces = Boolean(realite && section) && (!needsSousSectionColumn || sousKey !== null);

  const gridColsClass =
    section && needsSousSectionColumn ? "tae-miller-grid--4" : "tae-miller-grid--3";

  return (
    <div className="tae-miller-host w-full min-w-0">
      <div
        className={cn(
          "tae-miller-grid overflow-hidden rounded-xl ring-1 ring-border/50",
          gridColsClass,
        )}
      >
        <div className="tae-miller-col">
          <MillerColumnHead label="Réalité sociale" />
          <ul
            className={MILLER_COLUMN_LIST_CLASSNAME}
            role="listbox"
            aria-label="Réalités sociales"
          >
            {realites.map((t) => {
              const sel = realite === t;
              return (
                <li key={t} className="mb-1">
                  <button
                    type="button"
                    className={cn(
                      MILLER_CHOICE_BTN_WRAP,
                      "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      sel ? "bg-accent/12 font-semibold text-deep" : "text-steel hover:bg-surface",
                    )}
                    onClick={() => {
                      setRealite(t);
                      setSection(null);
                      setUserSousPick(null);
                    }}
                  >
                    {t}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="tae-miller-col">
          <MillerColumnHead label="Section" />
          <ul className={MILLER_COLUMN_LIST_CLASSNAME} role="listbox" aria-label="Sections">
            {realite ? (
              sections.map((s) => {
                const sel = section === s;
                return (
                  <li key={s} className="mb-1">
                    <button
                      type="button"
                      className={cn(
                        MILLER_CHOICE_BTN_WRAP,
                        "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        sel
                          ? "bg-accent/12 font-semibold text-deep"
                          : "text-steel hover:bg-surface",
                      )}
                      onClick={() => {
                        setSection(s);
                        setUserSousPick(null);
                      }}
                    >
                      {s}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-left text-sm text-muted">—</li>
            )}
          </ul>
        </div>

        {section && needsSousSectionColumn ? (
          <div className="tae-miller-col">
            <MillerColumnHead label="Sous-section" />
            <ul className={MILLER_COLUMN_LIST_CLASSNAME} role="listbox" aria-label="Sous-sections">
              {sousKeys.map((k) => {
                const sel = sousKey === k;
                const label = k === SOUS_NULL ? "—" : k;
                return (
                  <li key={k} className="mb-1">
                    <button
                      type="button"
                      className={cn(
                        MILLER_CHOICE_BTN_WRAP,
                        "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        sel
                          ? "bg-accent/12 font-semibold text-deep"
                          : "text-steel hover:bg-surface",
                      )}
                      onClick={() => setUserSousPick(k)}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="tae-miller-col">
          <MillerColumnHead label="Énoncé" />
          <ul className={MILLER_COLUMN_LIST_CLASSNAME} role="listbox" aria-label="Énoncés">
            {showEnonces ? (
              enoncesRows.map((r) => {
                const on = selectedIds.has(r.id);
                return (
                  <li key={r.id} className="mb-1">
                    <button
                      type="button"
                      className={cn(
                        MILLER_CHOICE_BTN_WRAP,
                        "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        on
                          ? "bg-success/15 font-medium text-deep ring-1 ring-inset ring-success/30"
                          : "text-steel hover:bg-surface",
                      )}
                      onClick={() => onToggle({ rowId: r.id, ...hecRowToSelection(r) })}
                    >
                      {r.enonce}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-6 text-left text-sm text-muted">—</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
