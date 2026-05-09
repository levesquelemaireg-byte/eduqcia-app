"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { ApercuImprimeInline } from "@/components/partagees/vue-detaillee/apercu-imprime";
import { CarrouselApercuModale } from "@/components/partagees/carrousel-apercu/modale";
import {
  NavbarModesImpression,
  type OptionCorrige,
} from "@/components/partagees/navbar-modes-impression";
import { SectionPileTaches } from "@/components/epreuve/vue-detaillee/sections/pile-taches";
import { EpreuveRail } from "@/components/epreuve/vue-detaillee/rail";
import { useRetourContextuel } from "@/hooks/partagees/use-retour-contextuel";
import { useCopierLien } from "@/hooks/partagees/use-copier-lien";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";

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
  // Modes d'impression — pilotés par la navbar (spec §13 règle 6).
  // Défaut épreuve : sommatif-standard + sans corrigé (spec §7.2).
  const [mode, setMode] = useState<ModeImpression>("sommatif-standard");
  const [optionCorrige, setOptionCorrige] = useState<OptionCorrige>("aucun");
  const retour = useRetourContextuel();
  const { copierLien } = useCopierLien();

  /* Déduire niveau/discipline depuis la première tâche si disponible */
  const premiereTache = donnees.taches[0] ?? null;
  const niveauLabel = premiereTache?.niveau.label;
  const disciplineLabel = premiereTache?.discipline.label;
  // Phase 6 : simple ET detaille mappent vers true (rendu différencié = Phase 5).
  const estCorrige = optionCorrige !== "aucun";
  const payloadImpression = useMemo(
    () =>
      ({
        type: "epreuve",
        donnees: donnees,
        mode,
        estCorrige,
      }) as const,
    [donnees, mode, estCorrige],
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
        onglets={<Onglets ongletActif={ongletActif} surChangerOnglet={setOngletActif} />}
        contenuPrincipal={
          ongletActif === "sommaire" ? (
            <SectionPileTaches taches={donnees.taches} />
          ) : (
            <div className="flex flex-col gap-4">
              <NavbarModesImpression
                entite="epreuve"
                mode={mode}
                optionCorrige={optionCorrige}
                surChangerMode={setMode}
                surChangerCorrige={setOptionCorrige}
              />
              <ApercuImprimeInline payload={payloadImpression} />
            </div>
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
