/**
 * BLOC5-CD.md — compétence disciplinaire (référentiels `public/data/hec-cd.json`, `hqc-cd.json`).
 */

import type { DisciplineCode } from "@/lib/tache/blueprint-helpers";
import type { CdSelection } from "@/lib/types/fiche";

export type CdCritereNode = { id: string; texte: string };

export type CdComposanteNode = {
  id: string;
  titre: string;
  criteres: CdCritereNode[];
};

export type CdCompetenceNode = {
  id: string;
  titre: string;
  composantes: CdComposanteNode[];
};

/** Sélection complète avec identifiants JSON (persistance / `cd_id` futur). */
export type CdSelectionWithIds = {
  competence: string;
  composante: string;
  critere: string;
  competenceId: string;
  composanteId: string;
  critereId: string;
};

export type CdFormSlice = {
  selection: CdSelectionWithIds | null;
};

export const initialCdFormSlice: CdFormSlice = { selection: null };

export function sanitizeCdFormSlice(raw: unknown): CdFormSlice {
  if (!raw || typeof raw !== "object") return initialCdFormSlice;
  const o = raw as Record<string, unknown>;
  const sel = o.selection;
  if (!sel || typeof sel !== "object") return { selection: null };
  const s = sel as Record<string, unknown>;
  const competence = typeof s.competence === "string" ? s.competence : "";
  const composante = typeof s.composante === "string" ? s.composante : "";
  const critere = typeof s.critere === "string" ? s.critere : "";
  const competenceId = typeof s.competenceId === "string" ? s.competenceId : "";
  const composanteId = typeof s.composanteId === "string" ? s.composanteId : "";
  const critereId = typeof s.critereId === "string" ? s.critereId : "";
  if (!competence.trim() || !composante.trim() || !critere.trim()) return { selection: null };
  /* IDs optionnels côté persistance : le RPC résout `cd_id` par texte (`publish-tache.resolveCdId`). */
  return {
    selection: {
      competence,
      composante,
      critere,
      competenceId: competenceId || "",
      composanteId: composanteId || "",
      critereId: critereId || "",
    },
  };
}

export function cdDataUrlForDiscipline(d: DisciplineCode): string | null {
  if (d === "hec") return "/data/hec-cd.json";
  if (d === "hqc") return "/data/hqc-cd.json";
  return null;
}

function parseCritere(raw: unknown): CdCritereNode | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.texte !== "string") return null;
  return { id: o.id, texte: o.texte };
}

function parseComposante(raw: unknown): CdComposanteNode | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.titre !== "string" || !Array.isArray(o.criteres)) {
    return null;
  }
  const criteres = o.criteres.map(parseCritere).filter((c): c is CdCritereNode => c !== null);
  return { id: o.id, titre: o.titre, criteres };
}

/** Ignore l’entrée `TYPE_FICHIER: METADONNEES` et les entrées invalides. */
export function parseCdJsonArray(raw: unknown): CdCompetenceNode[] {
  if (!Array.isArray(raw)) return [];
  const out: CdCompetenceNode[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.TYPE_FICHIER === "METADONNEES") continue;
    if (typeof o.id !== "string" || typeof o.titre !== "string" || !Array.isArray(o.composantes)) {
      continue;
    }
    const composantes = o.composantes
      .map(parseComposante)
      .filter((c): c is CdComposanteNode => c !== null);
    out.push({ id: o.id, titre: o.titre, composantes });
  }
  return out;
}

export function cdSelectionToFicheSlice(sel: CdSelectionWithIds | null): CdSelection | null {
  if (!sel) return null;
  const { competence, composante, critere } = sel;
  if (!competence.trim() || !composante.trim() || !critere.trim()) return null;
  return { competence, composante, critere };
}
