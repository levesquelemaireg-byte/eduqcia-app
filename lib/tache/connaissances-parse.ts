/**
 * docs/WORKFLOWS.md §7 — parsing JSON `hec-sec1-2.json`, `hqc-sec3-4.json`.
 */

import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import type { ConnRawRow, HecConnRow, HqcConnRow } from "@/lib/tache/connaissances-types";

export function connDataUrlForDiscipline(d: DisciplineCode): string | null {
  if (d === "hec") return "/data/hec-sec1-2.json";
  if (d === "hqc") return "/data/hqc-sec3-4.json";
  return null;
}

export function parseConnJsonArray(raw: unknown, discipline: DisciplineCode): ConnRawRow[] {
  if (!Array.isArray(raw)) return [];
  const out: ConnRawRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.TYPE_FICHIER === "METADONNEES") continue;
    if (typeof o.id !== "string" || typeof o.enonce !== "string") continue;
    const niveau = typeof o.niveau === "string" ? o.niveau : "";
    const section = typeof o.section === "string" ? o.section : "";
    const realiteSociale = typeof o.realite_sociale === "string" ? o.realite_sociale : "";

    if (discipline === "hqc") {
      const periode = typeof o.periode === "string" ? o.periode : "";
      const sousHqc =
        o.sous_section === null || o.sous_section === undefined
          ? null
          : typeof o.sous_section === "string"
            ? o.sous_section
            : null;
      out.push({
        kind: "hqc",
        id: o.id,
        niveau,
        periode,
        realite_sociale: realiteSociale,
        section,
        sous_section: sousHqc,
        enonce: o.enonce,
      } satisfies HqcConnRow);
      continue;
    }

    if (discipline === "hec") {
      const sous =
        o.sous_section === null || o.sous_section === undefined
          ? null
          : typeof o.sous_section === "string"
            ? o.sous_section
            : null;
      out.push({
        kind: "hec",
        id: o.id,
        niveau,
        realite_sociale: realiteSociale,
        section,
        sous_section: sous,
        enonce: o.enonce,
      } satisfies HecConnRow);
    }
  }
  return out;
}
