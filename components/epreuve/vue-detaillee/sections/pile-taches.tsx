"use client";

import { useState } from "react";
import { TacheMiniatureEpreuve } from "@/components/tache/miniature-epreuve";
import { TachePanneauDetail } from "@/components/tache/panneau-detail";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";

type Props = {
  taches: DonneesTache[];
};

/**
 * Pile verticale de TacheMiniatureEpreuve, numérotées.
 * Clic sur une carte → TachePanneauDetail en slide-over.
 */
export function SectionPileTaches({ taches }: Props) {
  const [tachePanneauId, setTachePanneauId] = useState<string | null>(null);

  if (taches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <span className="material-symbols-outlined text-[40px] text-muted" aria-hidden="true">
          assignment
        </span>
        <p className="text-sm text-muted">Aucune tâche dans cette épreuve</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {taches.map((tache, index) => (
          <TacheMiniatureEpreuve
            key={tache.id}
            rang={index + 1}
            donnees={tache}
            surClic={() => setTachePanneauId(tache.id)}
          />
        ))}

        <p className="text-[11px] text-muted">Cliquez sur une tâche pour voir ses détails.</p>
      </div>

      {tachePanneauId && (
        <TachePanneauDetail tacheId={tachePanneauId} surFermer={() => setTachePanneauId(null)} />
      )}
    </>
  );
}
