"use client";

import { useMemo, useState } from "react";
import {
  hecBranchNeedsSousColumn,
  hecRowToSelection,
  uniqueInOrder,
  type ConnaissanceSelectionWithIds,
  type HecConnRow,
} from "@/lib/tae/connaissances-helpers";
import { MillerColumnsLayout } from "@/components/ui/MillerColumnsLayout";
import { encSous, SOUS_NULL } from "@/components/tae/TaeForm/bloc7/millerConnaissancesEnc";

type Props = {
  rows: HecConnRow[];
  selectedIds: Set<string>;
  onToggle: (row: ConnaissanceSelectionWithIds) => void;
  syncNavigationRowId?: string | null;
  onReset?: () => void;
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
  return rows.find((x) => x.id === syncId)?.section ?? null;
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
  onReset,
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

  const needsSous = useMemo(() => {
    if (!realite || !section) return false;
    return hecBranchNeedsSousColumn(rows, realite, section);
  }, [rows, realite, section]);

  const sousKeys = useMemo(() => {
    if (!realite || !section || !needsSous) return [];
    return uniqueInOrder(
      rows
        .filter((r) => r.realite_sociale === realite && r.section === section)
        .map((r) => encSous(r.sous_section)),
    );
  }, [rows, realite, section, needsSous]);

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
    if (!realite || !section) return [];
    if (!needsSous) {
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
  }, [rows, realite, section, needsSous, sousKey]);

  const showEnonces = Boolean(realite && section) && (!needsSous || sousKey !== null);
  const colCount = section && needsSous ? 4 : 3;

  return (
    <MillerColumnsLayout
      columnCount={colCount as 3 | 4}
      onReset={onReset}
      resetDisabled={selectedIds.size === 0}
    >
      <MillerColumnsLayout.Column label="Réalité sociale" ariaLabel="Réalités sociales">
        {realites.map((t) => (
          <MillerColumnsLayout.NavItem
            key={t}
            active={realite === t}
            onClick={() => {
              setRealite(t);
              setSection(null);
              setUserSousPick(null);
            }}
          >
            {t}
          </MillerColumnsLayout.NavItem>
        ))}
      </MillerColumnsLayout.Column>

      <MillerColumnsLayout.Column label="Section">
        {realite ? (
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
          <MillerColumnsLayout.EmptyState message="Sélectionnez une réalité sociale" />
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
              onClick={() => onToggle({ rowId: r.id, ...hecRowToSelection(r) })}
            >
              {r.enonce}
            </MillerColumnsLayout.CheckItem>
          ))
        ) : (
          <MillerColumnsLayout.EmptyState
            message={
              !realite
                ? "Sélectionnez une réalité sociale"
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
