/**
 * Helpers purs pour le système de fiches.
 * - ready / skeleton / hidden : constructeurs SectionState
 * - sanitize : wrapper DOMPurify
 * - createSelector : mémoïsation légère maison (2-3 inputs, shallow compare)
 * - resolveDocPlaceholders : remplacement {{doc_N}} (et {{doc_A}} legacy) → numéros
 */

import DOMPurify from "isomorphic-dompurify";
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
 * Sanitise du HTML via DOMPurify (isomorphic — fonctionne client ET serveur).
 * Appelé dans les selectors avant passage au composant.
 * Les composants (ContentBlock, etc.) ne sanitisent PAS eux-mêmes.
 */
export function sanitize(html: string): string {
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

/**
 * Remplace les placeholders `{{doc_N}}` (nouveau, numérique) et `{{doc_A}}` (legacy, alphabétique)
 * par les numéros 1…N. Puis remplace les spans `data-doc-ref="X"` par la lettre seule.
 * Reproduit `consigne-helpers.ts:resolveDocPlaceholdersForSingleTask`.
 */
export function resolveDocPlaceholders(html: string, nbDocuments: number): string {
  if (!html) return "";
  const n = Math.max(nbDocuments, 0);
  let s = html;

  // Format numérique (nouveau) : {{doc_1}}, {{doc_2}}, … (insensible à la casse sur « doc »).
  s = s.replace(/\{\{doc_(\d+)\}\}/gi, (match, num: string) => {
    const idx = parseInt(num, 10) - 1;
    return idx >= 0 && idx < n ? String(idx + 1) : match;
  });

  // Format alphabétique (legacy, rétrocompat) : {{doc_A}} → 1, {{doc_B}} → 2, …
  s = s.replace(/\{\{doc_([A-Za-z])\}\}/gi, (match, letter: string) => {
    const idx = letter.toUpperCase().charCodeAt(0) - 65;
    return idx >= 0 && idx < n ? String(idx + 1) : match;
  });

  // <span data-doc-ref="A">...</span> → A
  s = s.replace(
    /<span[^>]*\bdata-doc-ref=["']([A-Za-z])["'][^>]*>[\s\S]*?<\/span>/gi,
    (_, letter: string) => letter.toUpperCase(),
  );

  return s;
}
