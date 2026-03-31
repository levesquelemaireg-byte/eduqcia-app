import type { ReactNode } from "react";
import { splitGrilleParenSegments } from "@/lib/tae/grilles/split-paren-groups";
import { tieAsciiParentheses } from "@/lib/tae/grilles/tie-ascii-parentheses";
import styles from "@/components/tae/grilles/eval-grid.module.css";

/**
 * Texte de cellule barème : chaque `(…)` est rendu en `nowrap` pour éviter toute césure interne
 * (ex. `(1 sur` | `2)`). Hors parenthèses, conserve `tieAsciiParentheses` pour les cas limites.
 */
export function grilleTextWithLockedParenGroups(text: string): ReactNode {
  const segments = splitGrilleParenSegments(text);
  if (segments.length === 1 && segments[0].kind === "text") {
    return tieAsciiParentheses(segments[0].value);
  }

  const nodes: ReactNode[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.kind === "text") {
      nodes.push(tieAsciiParentheses(seg.value));
    } else {
      nodes.push(
        <span key={`${i}-${seg.value}`} className={styles.nowrapParenGroup}>
          {seg.value}
        </span>,
      );
    }
  }
  return <>{nodes}</>;
}
