/**
 * Helpers purs pour le système de fiches.
 * - ready / skeleton / hidden : constructeurs SectionState
 * - sanitize : wrapper DOMPurify
 * - createSelector : mémoïsation légère maison (2-3 inputs, shallow compare)
 * - resolveDocPlaceholders : remplacement {{doc_A}} → numéros
 */

import DOMPurify from "dompurify";
import type { SectionState } from "@/lib/fiche/types";

/* ─── Constructeurs SectionState ───────────────────────────────── */

export function ready<T>(data: T): SectionState<T> {
  return { status: "ready", data };
}

export function skeleton<T>(): SectionState<T> {
  return { status: "skeleton" };
}

export function hidden<T>(): SectionState<T> {
  return { status: "hidden" };
}

/* ─── Sanitisation HTML ────────────────────────────────────────── */

/**
 * Sanitise du HTML via DOMPurify. Appelé dans les selectors avant passage au composant.
 * Les composants (ContentBlock, etc.) ne sanitisent PAS eux-mêmes.
 */
export function sanitize(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html);
}

/* ─── createSelector maison ────────────────────────────────────── */

/**
 * Mémoïsation légère (last-call cache, shallow compare des inputs).
 * Remplace reselect pour notre usage simple (2-3 inputs max).
 */
export function createSelector<S, R1, T>(
  inputSelectors: [(state: S) => R1],
  combiner: (r1: R1) => T,
): (state: S) => T;
export function createSelector<S, R1, R2, T>(
  inputSelectors: [(state: S) => R1, (state: S) => R2],
  combiner: (r1: R1, r2: R2) => T,
): (state: S) => T;
export function createSelector<S, R1, R2, R3, T>(
  inputSelectors: [(state: S) => R1, (state: S) => R2, (state: S) => R3],
  combiner: (r1: R1, r2: R2, r3: R3) => T,
): (state: S) => T;
export function createSelector(
  inputSelectors: ((state: never) => unknown)[],
  combiner: (...args: never[]) => unknown,
): (state: never) => unknown {
  let lastInputs: unknown[] | null = null;
  let lastResult: unknown;

  return (state: never): unknown => {
    const newInputs = inputSelectors.map((sel) => sel(state));
    if (
      lastInputs !== null &&
      newInputs.length === lastInputs.length &&
      newInputs.every((val, i) => val === lastInputs![i])
    ) {
      return lastResult;
    }
    lastInputs = newInputs;
    lastResult = (combiner as (...args: unknown[]) => unknown)(...newInputs);
    return lastResult;
  };
}

/* ─── Résolution des placeholders documents ────────────────────── */

const DOC_PLACEHOLDER_LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Remplace `{{doc_A}}` → `1`, `{{doc_B}}` → `2`, etc. (numéros, pas lettres).
 * Reproduit le comportement de `consigne-helpers.ts:resolveDocPlaceholdersForSingleTask`.
 *
 * Puis remplace les spans `data-doc-ref="X"` par la lettre seule (aperçu fiche).
 */
export function resolveDocPlaceholders(html: string, nbDocuments: number): string {
  if (!html) return "";
  const n = Math.min(Math.max(nbDocuments, 0), 4);
  let s = html;

  // {{doc_A}} → 1, {{doc_B}} → 2, etc.
  for (let i = 0; i < n; i++) {
    const L = DOC_PLACEHOLDER_LETTERS[i];
    s = s.replace(new RegExp(`\\{\\{doc_${L}\\}\\}`, "gi"), String(i + 1));
  }

  // <span data-doc-ref="A">...</span> → A
  s = s.replace(
    /<span[^>]*\bdata-doc-ref=["']([A-D])["'][^>]*>[\s\S]*?<\/span>/gi,
    (_, letter: string) => letter,
  );

  return s;
}
