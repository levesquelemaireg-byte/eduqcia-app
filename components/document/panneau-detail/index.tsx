"use client";

import { useEffect, useState } from "react";
import { PanneauLateral } from "@/components/partagees/panneau-lateral";
import { DocumentVueDetaillee } from "@/components/document/vue-detaillee";
import { fetchDocFicheDataAction } from "@/lib/actions/fetch-doc-fiche-data";
import type { DocFicheData } from "@/lib/fiche/types";

type EtatChargement =
  | { statut: "chargement" }
  | { statut: "pret"; data: DocFicheData }
  | { statut: "erreur" };

type Props = {
  docId: string;
  surFermer: () => void;
};

/**
 * Panneau latéral (slide-over) affichant la vue détaillée d'un document.
 * Utilisé depuis la vue détaillée tâche au clic sur un document.
 */
export function DocumentPanneauDetail({ docId, surFermer }: Props) {
  const [etat, setEtat] = useState<EtatChargement>({ statut: "chargement" });

  useEffect(() => {
    let annule = false;

    fetchDocFicheDataAction(docId).then((result) => {
      if (annule) return;
      if (result.ok) {
        setEtat({ statut: "pret", data: result.data });
      } else {
        setEtat({ statut: "erreur" });
      }
    });

    return () => {
      annule = true;
    };
  }, [docId]);

  return (
    <PanneauLateral surFermer={surFermer}>
      {etat.statut === "chargement" && <SkeletonPanneau />}
      {etat.statut === "erreur" && (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-muted" aria-hidden="true">
            error_outline
          </span>
          <p className="text-sm text-muted">Document indisponible</p>
        </div>
      )}
      {etat.statut === "pret" && (
        <DocumentVueDetaillee data={etat.data} estAuteur={false} layout="stacked" />
      )}
    </PanneauLateral>
  );
}

function SkeletonPanneau() {
  return (
    <div className="space-y-5 p-6">
      <div className="h-5 w-2/3 animate-pulse rounded bg-panel-alt" />
      <div className="h-4 w-full animate-pulse rounded bg-panel-alt" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-panel-alt" />
      <div className="mt-4 h-32 w-full animate-pulse rounded bg-panel-alt" />
    </div>
  );
}
