"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { ApercuImprimeInline } from "@/components/partagees/vue-detaillee/apercu-imprime";
import { CarrouselApercuModale } from "@/components/partagees/carrousel-apercu/modale";
import { SectionHero } from "@/components/epreuve/vue-detaillee/sections/hero";
import { SectionPileTaches } from "@/components/epreuve/vue-detaillee/sections/pile-taches";
import { EpreuveRail } from "@/components/epreuve/vue-detaillee/rail";
import { useRetourContextuel } from "@/hooks/partagees/use-retour-contextuel";
import { useCopierLien } from "@/hooks/partagees/use-copier-lien";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";

type Props = {
  donnees: DonneesEpreuve;
  estAuteur: boolean;
  estPubliee: boolean;
  auteurNom: string;
  /** Mode d'affichage : sidebar (page complète) ou stacked (panneau latéral). */
  layout?: "sidebar" | "stacked";
};

/**
 * Orchestrateur de la vue détaillée épreuve.
 * Utilise VueDetailleeLayout partagé + BarreActions + Onglets.
 * Compose SectionPileTaches (contenu) + EpreuveRail.
 * INV-R4 : même composant en page complète (sidebar) et en panneau (stacked).
 */
export function EpreuveVueDetaillee({
  donnees,
  estAuteur,
  estPubliee,
  auteurNom,
  layout = "sidebar",
}: Props) {
  const router = useRouter();
  const [ongletActif, setOngletActif] = useState<OngletId>("sommaire");
  const [carrouselOuvert, setCarrouselOuvert] = useState(false);
  const retour = useRetourContextuel();
  const { copierLien } = useCopierLien();

  /* Déduire niveau/discipline depuis la première tâche si disponible */
  const premiereTache = donnees.taches[0] ?? null;
  const niveauLabel = premiereTache?.niveau.label;
  const disciplineLabel = premiereTache?.discipline.label;
  const payloadImpression = useMemo(
    () =>
      ({
        type: "epreuve",
        donnees: donnees,
        mode: "formatif",
        estCorrige: false,
      }) as const,
    [donnees],
  );

  return (
    <>
      <VueDetailleeLayout
        layout={layout}
        barreActions={
          <BarreActions
            estAuteur={estAuteur}
            estEpinglee={false}
            entite="epreuve"
            retour={retour}
            surModifier={() => router.push(`/evaluations/${donnees.id}/edit`)}
            surEpingler={() => {
              /* TODO */
            }}
            surCopierLien={copierLien}
            surOuvrirVisionneuse={() => setCarrouselOuvert(true)}
            surSupprimer={() => {
              /* TODO */
            }}
            layout={layout}
          />
        }
        header={
          <SectionHero
            titre={donnees.titre}
            estPubliee={estPubliee}
            nbTaches={donnees.taches.length}
            niveauLabel={niveauLabel}
            disciplineLabel={disciplineLabel}
          />
        }
        onglets={<Onglets ongletActif={ongletActif} surChangerOnglet={setOngletActif} />}
        contenuPrincipal={
          ongletActif === "sommaire" ? (
            <SectionPileTaches taches={donnees.taches} />
          ) : (
            <ApercuImprimeInline payload={payloadImpression} />
          )
        }
        rail={
          <EpreuveRail
            titre={donnees.titre}
            taches={donnees.taches}
            estPubliee={estPubliee}
            auteurNom={auteurNom}
            niveauLabel={niveauLabel}
            disciplineLabel={disciplineLabel}
          />
        }
      />

      <CarrouselApercuModale
        open={carrouselOuvert}
        onClose={() => setCarrouselOuvert(false)}
        payload={payloadImpression}
      />
    </>
  );
}
