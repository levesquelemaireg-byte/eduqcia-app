"use client";

import { useMemo, useState } from "react";
import {
  hqcBranchNeedsSousColumn,
  hqcRowToSelection,
  uniqueInOrder,
  type ConnaissanceSelectionWithIds,
  type HqcConnRow,
} from "@/lib/tae/connaissances-helpers";
import { cn } from "@/lib/utils/cn";
import { MILLER_CHOICE_BTN_WRAP, MILLER_COLUMN_LIST_CLASSNAME } from "@/lib/ui/miller-columns";
import { MillerColumnHead } from "@/components/tae/TaeForm/bloc7/MillerColumnHead";
import { encSous, SOUS_NULL } from "@/components/tae/TaeForm/bloc7/millerConnaissancesEnc";

function pairKeyFromParts(periode: string, realite: string): string {
  return JSON.stringify([periode, realite]);
}

type Props = {
  rows: HqcConnRow[];
  selectedIds: Set<string>;
  onToggle: (row: ConnaissanceSelectionWithIds) => void;
  syncNavigationRowId?: string | null;
};

function findHqcPairIdx(rows: HqcConnRow[], syncId: string | null): number {
  if (!syncId) return 0;
  const r = rows.find((x) => x.id === syncId);
  if (!r) return 0;
  const keys = uniqueInOrder(rows.map((row) => pairKeyFromParts(row.periode, row.realite_sociale)));
  const i = keys.findIndex((k) => {
    const [periode, realite] = JSON.parse(k) as [string, string];
    return periode === r.periode && realite === r.realite_sociale;
  });
  return i >= 0 ? i : 0;
}

function initialHqcSection(rows: HqcConnRow[], syncId: string | null): string | null {
  if (!syncId) return null;
  const r = rows.find((x) => x.id === syncId);
  return r?.section ?? null;
}

function initialHqcSousPick(rows: HqcConnRow[], syncId: string | null): string | null {
  if (!syncId) return null;
  const r = rows.find((x) => x.id === syncId);
  if (!r) return null;
  if (!hqcBranchNeedsSousColumn(rows, r.periode, r.realite_sociale, r.section)) return null;
  return encSous(r.sous_section);
}

export function MillerConnaissancesHqc({
  rows,
  selectedIds,
  onToggle,
  syncNavigationRowId = null,
}: Props) {
  const syncId = syncNavigationRowId ?? null;
  const pairs = useMemo(() => {
    const keys = uniqueInOrder(rows.map((r) => pairKeyFromParts(r.periode, r.realite_sociale)));
    return keys.map((k) => JSON.parse(k) as [string, string]);
  }, [rows]);

  const [pairIdx, setPairIdx] = useState(() => findHqcPairIdx(rows, syncId));
  const [section, setSection] = useState<string | null>(() => initialHqcSection(rows, syncId));
  const [userSousPick, setUserSousPick] = useState<string | null>(() =>
    initialHqcSousPick(rows, syncId),
  );

  const currentPair = pairs[pairIdx] ?? null;

  const sections = useMemo(() => {
    if (!currentPair) return [];
    const [periode, realite] = currentPair;
    return uniqueInOrder(
      rows
        .filter((r) => r.periode === periode && r.realite_sociale === realite)
        .map((r) => r.section),
    );
  }, [rows, currentPair]);

  const needsSousSectionColumn = useMemo(() => {
    if (!currentPair || !section) return false;
    const [periode, realite] = currentPair;
    return hqcBranchNeedsSousColumn(rows, periode, realite, section);
  }, [rows, currentPair, section]);

  const sousKeys = useMemo(() => {
    if (!currentPair || !section || !needsSousSectionColumn) return [];
    const [periode, realite] = currentPair;
    return uniqueInOrder(
      rows
        .filter(
          (r) => r.periode === periode && r.realite_sociale === realite && r.section === section,
        )
        .map((r) => encSous(r.sous_section)),
    );
  }, [rows, currentPair, section, needsSousSectionColumn]);

  const autoResolvedSousKey = useMemo(() => {
    if (!needsSousSectionColumn || !currentPair || !section) return null;
    if (sousKeys.length === 0) return null;
    if (sousKeys.length === 1) return sousKeys[0]!;
    return null;
  }, [needsSousSectionColumn, currentPair, section, sousKeys]);

  const sousKey = useMemo(() => {
    if (autoResolvedSousKey !== null) return autoResolvedSousKey;
    if (userSousPick !== null && sousKeys.includes(userSousPick)) return userSousPick;
    return null;
  }, [autoResolvedSousKey, userSousPick, sousKeys]);

  const enoncesRows = useMemo(() => {
    if (!currentPair || !section) return [];
    const [periode, realite] = currentPair;
    if (!needsSousSectionColumn) {
      return rows.filter(
        (r) => r.periode === periode && r.realite_sociale === realite && r.section === section,
      );
    }
    if (sousKey === null) return [];
    const sk = sousKey === SOUS_NULL ? null : sousKey;
    return rows.filter(
      (r) =>
        r.periode === periode &&
        r.realite_sociale === realite &&
        r.section === section &&
        (r.sous_section === null ? SOUS_NULL : r.sous_section) === encSous(sk),
    );
  }, [rows, currentPair, section, needsSousSectionColumn, sousKey]);

  const showEnonces =
    Boolean(currentPair && section) && (!needsSousSectionColumn || sousKey !== null);

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
          <MillerColumnHead label="Période et réalité" />
          <ul
            className={MILLER_COLUMN_LIST_CLASSNAME}
            role="listbox"
            aria-label="Périodes et réalités sociales"
          >
            {pairs.map((p, i) => {
              const label = `${p[0]} — ${p[1]}`;
              const sel = pairIdx === i;
              return (
                <li key={pairKeyFromParts(p[0], p[1])} className="mb-1">
                  <button
                    type="button"
                    className={cn(
                      MILLER_CHOICE_BTN_WRAP,
                      "w-full rounded-lg px-3 py-2.5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      sel ? "bg-accent/12 font-semibold text-deep" : "text-steel hover:bg-surface",
                    )}
                    onClick={() => {
                      setPairIdx(i);
                      setSection(null);
                      setUserSousPick(null);
                    }}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="tae-miller-col">
          <MillerColumnHead label="Section" />
          <ul className={MILLER_COLUMN_LIST_CLASSNAME} role="listbox" aria-label="Sections">
            {currentPair ? (
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
                      onClick={() => onToggle({ rowId: r.id, ...hqcRowToSelection(r) })}
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
