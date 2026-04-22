"use client";

import { useMemo, useState } from "react";
import {
  hqcBranchNeedsSousColumn,
  hqcRowToSelection,
  uniqueInOrder,
  type ConnaissanceSelectionWithIds,
  type HqcConnRow,
} from "@/lib/tache/connaissances-helpers";
import { MillerColumnsLayout } from "@/components/ui/MillerColumnsLayout";
import { encSous, SOUS_NULL } from "@/components/tache/wizard/bloc7/millerConnaissancesEnc";

function pairKeyFromParts(periode: string, realite: string): string {
  return JSON.stringify([periode, realite]);
}

type Props = {
  rows: HqcConnRow[];
  selectedIds: Set<string>;
  onToggle: (row: ConnaissanceSelectionWithIds) => void;
  syncNavigationRowId?: string | null;
  onReset?: () => void;
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
  return rows.find((x) => x.id === syncId)?.section ?? null;
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
  onReset,
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

  const needsSous = useMemo(() => {
    if (!currentPair || !section) return false;
    return hqcBranchNeedsSousColumn(rows, currentPair[0], currentPair[1], section);
  }, [rows, currentPair, section]);

  const sousKeys = useMemo(() => {
    if (!currentPair || !section || !needsSous) return [];
    const [periode, realite] = currentPair;
    return uniqueInOrder(
      rows
        .filter(
          (r) => r.periode === periode && r.realite_sociale === realite && r.section === section,
        )
        .map((r) => encSous(r.sous_section)),
    );
  }, [rows, currentPair, section, needsSous]);

  const autoSousKey = useMemo(() => {
    if (!needsSous) return null;
    return sousKeys.length === 1 ? sousKeys[0]! : null;
  }, [needsSous, sousKeys]);

  const sousKey = useMemo(() => {
    if (autoSousKey !== null) return autoSousKey;
    if (userSousPick !== null && sousKeys.includes(userSousPick)) return userSousPick;
    return null;
  }, [autoSousKey, userSousPick, sousKeys]);

  const enonces = useMemo(() => {
    if (!currentPair || !section) return [];
    const [periode, realite] = currentPair;
    if (!needsSous) {
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
  }, [rows, currentPair, section, needsSous, sousKey]);

  const showEnonces = Boolean(currentPair && section) && (!needsSous || sousKey !== null);
  const colCount = section && needsSous ? 4 : 3;

  return (
    <MillerColumnsLayout
      columnCount={colCount as 3 | 4}
      onReset={onReset}
      resetDisabled={selectedIds.size === 0}
    >
      <MillerColumnsLayout.Column
        label="Période et réalité"
        ariaLabel="Périodes et réalités sociales"
      >
        {pairs.map((p, i) => (
          <MillerColumnsLayout.NavItem
            key={pairKeyFromParts(p[0], p[1])}
            active={pairIdx === i}
            onClick={() => {
              setPairIdx(i);
              setSection(null);
              setUserSousPick(null);
            }}
          >
            {p[0]} — {p[1]}
          </MillerColumnsLayout.NavItem>
        ))}
      </MillerColumnsLayout.Column>

      <MillerColumnsLayout.Column label="Section">
        {currentPair ? (
          sections.map((s) => (
            <MillerColumnsLayout.NavItem
              key={s}
              active={section === s}
              onClick={() => {
                setSection(s);
                setUserSousPick(null);
              }}
            >
              {s}
            </MillerColumnsLayout.NavItem>
          ))
        ) : (
          <MillerColumnsLayout.EmptyState message="Sélectionnez une période" />
        )}
      </MillerColumnsLayout.Column>

      {section && needsSous ? (
        <MillerColumnsLayout.Column label="Sous-section">
          {sousKeys.map((k) => (
            <MillerColumnsLayout.NavItem
              key={k}
              active={sousKey === k}
              onClick={() => setUserSousPick(k)}
            >
              {k === SOUS_NULL ? "—" : k}
            </MillerColumnsLayout.NavItem>
          ))}
        </MillerColumnsLayout.Column>
      ) : null}

      <MillerColumnsLayout.Column label="Énoncé">
        {showEnonces ? (
          enonces.map((r) => (
            <MillerColumnsLayout.CheckItem
              key={r.id}
              checked={selectedIds.has(r.id)}
              onClick={() => onToggle({ rowId: r.id, ...hqcRowToSelection(r) })}
            >
              {r.enonce}
            </MillerColumnsLayout.CheckItem>
          ))
        ) : (
          <MillerColumnsLayout.EmptyState
            message={
              !currentPair
                ? "Sélectionnez une période"
                : !section
                  ? "Sélectionnez une section"
                  : needsSous && !sousKey
                    ? "Sélectionnez une sous-section"
                    : "Sélectionnez une section"
            }
          />
        )}
      </MillerColumnsLayout.Column>
    </MillerColumnsLayout>
  );
}
