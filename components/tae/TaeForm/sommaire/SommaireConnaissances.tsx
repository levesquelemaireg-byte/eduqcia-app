"use client";

import type { ConnaissanceSelectionWithIds } from "@/lib/tae/connaissances-helpers";
import { ConnaissanceRemoveButton } from "@/components/tae/fiche/ConnaissanceRemoveButton";
import { SkeletonMillerConnaissances } from "@/components/tae/TaeForm/sommaire/SommaireSkeletons";

type Props = {
  items: ConnaissanceSelectionWithIds[];
  /** Retirer une ligne du sommaire — `docs/DECISIONS.md` · Étape 6 (Retirer cette connaissance). */
  onRemoveRow?: (rowId: string) => void;
};

/** docs/WORKFLOWS.md §7.4 — chemin hiérarchique par énoncé (aperçu sommaire). */
export function SommaireConnaissances({ items, onRemoveRow }: Props) {
  if (items.length === 0) {
    return <SkeletonMillerConnaissances />;
  }

  return (
    <div className="mt-3 space-y-3">
      {items.map((conn) => (
        <div
          key={conn.rowId}
          className="relative rounded-md p-3 pr-11 transition-colors has-[.connaissance-remove-trigger:hover]:bg-surface/55 sm:p-3.5 sm:pr-12"
        >
          {onRemoveRow ? (
            <div className="absolute right-2 top-2 z-1 sm:right-2.5 sm:top-2.5">
              <ConnaissanceRemoveButton onClick={() => onRemoveRow(conn.rowId)} />
            </div>
          ) : null}
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-deep">{conn.realite_sociale}</p>
            <div className="ml-3 border-l border-border pl-3">
              <p className="text-sm text-steel">{conn.section}</p>
              {conn.sous_section ? (
                <div className="mt-0.5 ml-3 border-l border-border pl-3">
                  <p className="text-sm text-steel">{conn.sous_section}</p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-deep">{conn.enonce}</p>
                </div>
              ) : (
                <p className="mt-0.5 text-sm font-medium leading-snug text-deep">{conn.enonce}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
