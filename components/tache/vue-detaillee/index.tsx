"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TacheFicheData, PeerVoteTally } from "@/lib/types/fiche";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { useFicheModale } from "@/hooks/partagees/use-fiche-modale";
import { useRetourContextuel } from "@/hooks/partagees/use-retour-contextuel";
import { useCopierLien } from "@/hooks/partagees/use-copier-lien";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { ApercuImprimeInline } from "@/components/partagees/vue-detaillee/apercu-imprime";
import { CarrouselApercuModale } from "@/components/partagees/carrousel-apercu/modale";
import {
  NavbarModesImpression,
  type OptionCorrige,
} from "@/components/partagees/navbar-modes-impression";
import { FluxLecture } from "@/components/tache/vue-detaillee/flux-lecture";
import { TacheRail } from "@/components/tache/vue-detaillee/rail";
import { FicheModale } from "@/components/partagees/fiche-modale";
import { DocumentPanneauDetail } from "@/components/document/panneau-detail";

type Props = {
  tache: TacheFicheData;
  /** Données structurées pour le pipeline d'impression. Fournies par le serveur. */
  donneesTache?: DonneesTache;
  votes: PeerVoteTally | null;
  peutVoter: boolean;
  estAuteur: boolean;
  /** Mode d'affichage : sidebar (page complète) ou stacked (panneau latéral). */
  layout?: "sidebar" | "stacked";
};

/**
 * Orchestrateur de la vue détaillée tâche.
 * Utilise VueDetailleeLayout partagé + BarreActions partagée + Onglets.
 * Compose flux principal (FluxLecture) + rail (TacheRail) + modale/panneau document.
 * INV-R4 : même composant en page complète (sidebar) et en panneau (stacked).
 */
export function TacheVueDetaillee({
  tache,
  donneesTache,
  votes,
  peutVoter,
  estAuteur,
  layout = "sidebar",
}: Props) {
  const router = useRouter();
  const { modaleOuverte, cibleModale, ouvrirFicheModale, fermerFicheModale } = useFicheModale();
  const heroRef = useRef<HTMLHeadingElement>(null);
  const [ongletActif, setOngletActif] = useState<OngletId>("sommaire");
  const [docPanneauId, setDocPanneauId] = useState<string | null>(null);
  const [carrouselOuvert, setCarrouselOuvert] = useState(false);
  // Modes d'impression — pilotés par la navbar (spec §13 règle 6 : jamais hardcodé).
  // Défaut tâche : formatif + sans corrigé (spec §7.2).
  const [mode, setMode] = useState<ModeImpression>("formatif");
  const [optionCorrige, setOptionCorrige] = useState<OptionCorrige>("aucun");
  const retour = useRetourContextuel();
  const { copierLien } = useCopierLien();

  /* Focus initial sur le h1 du hero pour les lecteurs d'écran */
  useEffect(() => {
    heroRef.current?.focus();
  }, []);

  const surClicDocument = useCallback(
    (docId: string) => {
      if (layout === "stacked") {
        setDocPanneauId(docId);
      } else {
        ouvrirFicheModale({ kind: "document", id: docId });
      }
    },
    [ouvrirFicheModale, layout],
  );

  // estCorrige : Phase 6 mappe simple ET detaille vers true. Le rendu différencié
  // (overlay simple vs annexe détaillée) arrive en Phase 5.
  const estCorrige = optionCorrige !== "aucun";
  const payloadImpression = useMemo(
    () =>
      donneesTache
        ? ({
            type: "tache",
            donnees: donneesTache,
            mode,
            estCorrige,
          } as const)
        : null,
    [donneesTache, mode, estCorrige],
  );

  return (
    <>
      <VueDetailleeLayout
        layout={layout}
        barreActions={
          <BarreActions
            estAuteur={estAuteur}
            estEpinglee={false}
            entite="tache"
            retour={retour}
            surModifier={() => router.push(`/questions/${tache.id}/edit`)}
            surEpingler={() => {
              /* TODO */
            }}
            surCopierLien={copierLien}
            surOuvrirVisionneuse={() => setCarrouselOuvert(true)}
            surSupprimer={() => {
              /* TODO */
            }}
            surAjouterEpreuve={() => {
              /* TODO */
            }}
            layout={layout}
          />
        }
        onglets={<Onglets ongletActif={ongletActif} surChangerOnglet={setOngletActif} />}
        contenuPrincipal={
          ongletActif === "sommaire" ? (
            <FluxLecture
              tache={tache}
              votes={votes}
              peutVoter={peutVoter}
              surClicDocument={surClicDocument}
              heroRef={heroRef}
            />
          ) : payloadImpression ? (
            <div className="flex flex-col gap-4">
              <NavbarModesImpression
                entite="tache"
                mode={mode}
                optionCorrige={optionCorrige}
                surChangerMode={setMode}
                surChangerCorrige={setOptionCorrige}
              />
              <ApercuImprimeInline payload={payloadImpression} />
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted">
              <span
                className="material-symbols-outlined mb-2 block text-[32px] text-muted"
                aria-hidden="true"
              >
                print
              </span>
              Aperçu non disponible
            </div>
          )
        }
        rail={<TacheRail tache={tache} />}
      />

      {modaleOuverte && cibleModale?.kind === "document" ? (
        <FicheModale docId={cibleModale.id} surFermer={fermerFicheModale} />
      ) : null}

      {docPanneauId && (
        <DocumentPanneauDetail docId={docPanneauId} surFermer={() => setDocPanneauId(null)} />
      )}

      {payloadImpression && (
        <CarrouselApercuModale
          open={carrouselOuvert}
          onClose={() => setCarrouselOuvert(false)}
          payload={payloadImpression}
        />
      )}
    </>
  );
}
