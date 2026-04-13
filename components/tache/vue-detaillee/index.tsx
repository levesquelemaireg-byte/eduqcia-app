"use client";

import { useCallback, useEffect, useRef } from "react";
import type { TaeFicheData, PeerVoteTally } from "@/lib/types/fiche";
import { useFicheModale } from "@/hooks/partagees/use-fiche-modale";
import { TacheBarreActions } from "@/components/tache/vue-detaillee/barre-actions";
import { TacheVueDetailleeLayout } from "@/components/tache/vue-detaillee/layout";
import { FluxLecture } from "@/components/tache/vue-detaillee/flux-lecture";
import { TacheRail } from "@/components/tache/vue-detaillee/rail";
import { FicheModale } from "@/components/partagees/fiche-modale";

type Props = {
  tae: TaeFicheData;
  votes: PeerVoteTally | null;
  peutVoter: boolean;
  estAuteur: boolean;
};

/**
 * Orchestrateur de la vue détaillée tâche.
 * Compose barre d'actions + layout 2 colonnes (flux + rail) + modale fiche document.
 * Connecte `surClicDocument` (DocCards) → `ouvrirFicheModale`.
 */
export function TacheVueDetaillee({ tae, votes, peutVoter, estAuteur }: Props) {
  const { modaleOuverte, cibleModale, ouvrirFicheModale, fermerFicheModale } = useFicheModale();
  const heroRef = useRef<HTMLHeadingElement>(null);

  /* Focus initial sur le h1 du hero pour les lecteurs d'écran */
  useEffect(() => {
    heroRef.current?.focus();
  }, []);

  const surClicDocument = useCallback(
    (docId: string) => {
      ouvrirFicheModale({ kind: "document", id: docId });
    },
    [ouvrirFicheModale],
  );

  return (
    <>
      <TacheBarreActions taeId={tae.id} estAuteur={estAuteur} />

      <TacheVueDetailleeLayout rail={<TacheRail tae={tae} />}>
        <FluxLecture
          tae={tae}
          votes={votes}
          peutVoter={peutVoter}
          surClicDocument={surClicDocument}
          heroRef={heroRef}
        />
      </TacheVueDetailleeLayout>

      {modaleOuverte && cibleModale?.kind === "document" ? (
        <FicheModale docId={cibleModale.id} surFermer={fermerFicheModale} />
      ) : null}
    </>
  );
}
