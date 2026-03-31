"use client";

import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import { GrilleAbsente } from "@/components/tae/grilles/GrilleAbsente";
import { renderGrilleNode } from "@/components/tae/grilles/grille-registry";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/tae/grilles/eval-grid.module.css";

export type GrilleEvalViewportVariant = "default" | "compact" | "comfort";

type Props = {
  entry: GrilleEntry | null;
  /** Si `entry` est absent : libellé de l’outil attendu (ex. `outil_evaluation`). */
  outilEvaluationId?: string | null;
  /** `compact` = impression / cible densité Letter ; `comfort` = modale lecture. */
  viewport?: GrilleEvalViewportVariant;
};

/** Tableau de barème ministériel seul (pas de titre visible) — même rendu modale / impression. */
export function GrilleEvalTable({ entry, outilEvaluationId, viewport = "default" }: Props) {
  const viewportClass =
    viewport === "compact"
      ? styles.viewportCompact
      : viewport === "comfort"
        ? styles.viewportComfort
        : undefined;

  const shellClass = cn(styles.evalViewport, viewportClass);

  if (!entry) {
    const idLabel =
      typeof outilEvaluationId === "string" && outilEvaluationId.trim() !== ""
        ? outilEvaluationId.trim()
        : "—";
    return (
      <div className={shellClass} data-tae-print-eval-grid>
        <GrilleAbsente id={idLabel} />
      </div>
    );
  }

  return (
    <div className={shellClass} data-tae-print-eval-grid>
      {renderGrilleNode(entry)}
    </div>
  );
}
