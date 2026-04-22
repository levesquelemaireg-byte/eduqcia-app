"use client";

import { useEffect, useState } from "react";
import { PanneauLateral } from "@/components/partagees/panneau-lateral";
import { TacheVueDetaillee } from "@/components/tache/vue-detaillee";
import type { TacheFicheData, PeerVoteTally } from "@/lib/types/fiche";

type EtatChargement =
  | { statut: "chargement" }
  | { statut: "pret"; tache: TacheFicheData; votes: PeerVoteTally | null }
  | { statut: "erreur" };

type Props = {
  tacheId: string;
  surFermer: () => void;
};

/**
 * Panneau latéral (slide-over) affichant la vue détaillée d'une tâche.
 * Utilisé depuis la vue détaillée épreuve au clic sur une tâche.
 */
export function TachePanneauDetail({ tacheId, surFermer }: Props) {
  const [etat, setEtat] = useState<EtatChargement>({ statut: "chargement" });

  useEffect(() => {
    let annule = false;

    fetchTacheFicheBundleClient(tacheId).then((result) => {
      if (annule) return;
      if (result) {
        setEtat({ statut: "pret", tache: result.fiche, votes: result.votes });
      } else {
        setEtat({ statut: "erreur" });
      }
    });

    return () => {
      annule = true;
    };
  }, [tacheId]);

  return (
    <PanneauLateral surFermer={surFermer}>
      {etat.statut === "chargement" && <SkeletonPanneau />}
      {etat.statut === "erreur" && (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-muted" aria-hidden="true">
            error_outline
          </span>
          <p className="text-sm text-muted">Tâche indisponible</p>
        </div>
      )}
      {etat.statut === "pret" && (
        <TacheVueDetaillee
          tache={etat.tache}
          votes={etat.votes}
          peutVoter={false}
          estAuteur={false}
          layout="stacked"
        />
      )}
    </PanneauLateral>
  );
}

/**
 * Fetch côté client via Server Action.
 * Le `fetchTacheFicheBundle` est une fonction serveur — on l'appelle
 * indirectement via une action dédiée.
 */
async function fetchTacheFicheBundleClient(
  tacheId: string,
): Promise<{ fiche: TacheFicheData; votes: PeerVoteTally | null } | null> {
  try {
    const { fetchTachePanneauAction } = await import("@/lib/actions/fetch-tache-panneau");
    const result = await fetchTachePanneauAction(tacheId);
    if (result.ok) return result.data;
    return null;
  } catch {
    return null;
  }
}

function SkeletonPanneau() {
  return (
    <div className="space-y-5 p-6">
      <div className="h-5 w-2/3 animate-pulse rounded bg-panel-alt" />
      <div className="h-4 w-full animate-pulse rounded bg-panel-alt" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-panel-alt" />
      <div className="h-20 w-full animate-pulse rounded bg-panel-alt" />
      <div className="h-4 w-4/6 animate-pulse rounded bg-panel-alt" />
    </div>
  );
}
