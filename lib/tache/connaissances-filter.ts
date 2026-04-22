/**
 * docs/WORKFLOWS.md §7.1 — filtre par niveau (réalités HEC, périodes HQC).
 */

import { NIVEAUX } from "@/components/tache/wizard/bloc2/constants";
import type { NiveauCode } from "@/lib/tache/blueprint-helpers";
import type { ConnRawRow, HecConnRow, HqcConnRow } from "@/lib/tache/connaissances-types";

/** Ordre de première apparition, uniques. */
export function uniqueInOrder<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function niveauLabel(n: NiveauCode): string {
  return NIVEAUX.find((x) => x.value === n)?.label ?? "";
}

export function filterConnRowsByNiveau(rows: ConnRawRow[], niveau: NiveauCode): ConnRawRow[] {
  const label = niveauLabel(niveau);
  const byNiv = rows.filter((r) => r.niveau === label);
  if (byNiv.length === 0) return [];

  if (byNiv[0].kind === "hec") {
    const hec = byNiv as HecConnRow[];
    const uniqueRealites = uniqueInOrder(hec.map((r) => r.realite_sociale));
    let allowed: Set<string>;
    if (niveau === "sec1") {
      allowed = new Set(uniqueRealites.slice(0, 6));
    } else if (niveau === "sec2") {
      allowed = new Set(uniqueRealites.slice(-6));
    } else {
      return [];
    }
    return hec.filter((r) => allowed.has(r.realite_sociale));
  }

  const hqc = byNiv as HqcConnRow[];
  const uniquePeriods = uniqueInOrder(hqc.map((r) => r.periode));
  let allowed: Set<string>;
  if (niveau === "sec3") {
    allowed = new Set(uniquePeriods.slice(0, 4));
  } else if (niveau === "sec4") {
    allowed = new Set(uniquePeriods.slice(-4));
  } else {
    return [];
  }
  return hqc.filter((r) => allowed.has(r.periode));
}
