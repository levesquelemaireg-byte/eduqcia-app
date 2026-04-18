"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TaeFicheData, PeerVoteTally } from "@/lib/types/fiche";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import { StatusBadge } from "@/lib/fiche/primitives/MetaRow";
import { useFicheModale } from "@/hooks/partagees/use-fiche-modale";
import { useRetourContextuel } from "@/hooks/partagees/use-retour-contextuel";
import { useCopierLien } from "@/hooks/partagees/use-copier-lien";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { ApercuImprimeInline } from "@/components/partagees/vue-detaillee/apercu-imprime";
import { FluxLecture } from "@/components/tache/vue-detaillee/flux-lecture";
import { TacheRail } from "@/components/tache/vue-detaillee/rail";
import { FicheModale } from "@/components/partagees/fiche-modale";
import { DocumentPanneauDetail } from "@/components/document/panneau-detail";

type Props = {
  tae: TaeFicheData;
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
  tae,
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

  const contexte = [tae.niveau.label, tae.discipline.label].filter(Boolean).join(" · ");

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
            surModifier={() => router.push(`/questions/${tae.id}/edit`)}
            surEpingler={() => {
              /* TODO */
            }}
            surCopierLien={copierLien}
            surOuvrirVisionneuse={() => {
              /* TODO */
            }}
            surSupprimer={() => {
              /* TODO */
            }}
            surAjouterEpreuve={() => {
              /* TODO */
            }}
            layout={layout}
          />
        }
        header={
          <div className="space-y-1.5">
            <StatusBadge
              label={tae.is_published ? "Publiée" : "Brouillon"}
              variant={tae.is_published ? "published" : "draft"}
            />
            {contexte && <p className="text-sm text-steel">{contexte}</p>}
          </div>
        }
        onglets={<Onglets ongletActif={ongletActif} surChangerOnglet={setOngletActif} />}
        contenuPrincipal={
          ongletActif === "sommaire" ? (
            <FluxLecture
              tae={tae}
              votes={votes}
              peutVoter={peutVoter}
              surClicDocument={surClicDocument}
              heroRef={heroRef}
            />
          ) : donneesTache ? (
            <ApercuImprimeInline payload={{ type: "tache", donnees: donneesTache }} />
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
        rail={<TacheRail tae={tae} />}
      />

      {modaleOuverte && cibleModale?.kind === "document" ? (
        <FicheModale docId={cibleModale.id} surFermer={fermerFicheModale} />
      ) : null}

      {docPanneauId && (
        <DocumentPanneauDetail docId={docPanneauId} surFermer={() => setDocPanneauId(null)} />
      )}
    </>
  );
}
