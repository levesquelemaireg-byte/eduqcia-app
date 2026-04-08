/**
 * Types DEV — fragment playground (`/dev/fragments`).
 * Les données fiche canoniques : `TaeFicheData` dans `lib/types/fiche.ts` uniquement.
 */

export type PlaygroundDisplayContext = "wizard" | "sommaire" | "lecture" | "thumbnail" | "print";

export const PLAYGROUND_CONTEXT_ORDER: PlaygroundDisplayContext[] = [
  "wizard",
  "sommaire",
  "lecture",
  "thumbnail",
  "print",
];

export const PLAYGROUND_LOCAL_STORAGE_COMPORTEMENT_KEY =
  "eduqcia.fragment-playground.comportement-id-v2";

/** Vue complète (composant prod entier) vs un seul fragment (dropdown). */
export type PlaygroundViewMode = "full" | "isolated";
