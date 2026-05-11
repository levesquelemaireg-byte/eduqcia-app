"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { ApercuImprimeInline } from "@/components/partagees/vue-detaillee/apercu-imprime";
import { CarrouselApercuModale } from "@/components/partagees/carrousel-apercu/modale";
import { FEUILLET_LABELS_COPY } from "@/components/partagees/carrousel-apercu/copy";
import { SectionPileTaches } from "@/components/epreuve/vue-detaillee/sections/pile-taches";
import { EpreuveRail } from "@/components/epreuve/vue-detaillee/rail";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useRetourContextuel } from "@/hooks/partagees/use-retour-contextuel";
import { useCopierLien } from "@/hooks/partagees/use-copier-lien";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { TypeFeuillet } from "@/lib/epreuve/pagination/types";

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
  // Mode FIXE sommatif-standard → 2 feuillets (dossier + questionnaire).
  // Le toggle est rendu dans la barre des onglets parents (slot `actions`).
  const [feuilletActif, setFeuilletActif] = useState<TypeFeuillet>("dossier-documentaire");
  const retour = useRetourContextuel();
  const { copierLien } = useCopierLien();

  const optionsFeuillets = useMemo(
    () => [
      {
        value: "dossier-documentaire" as const,
        label: FEUILLET_LABELS_COPY["dossier-documentaire"],
      },
      { value: "questionnaire" as const, label: FEUILLET_LABELS_COPY["questionnaire"] },
    ],
    [],
  );

  /* Déduire niveau/discipline depuis la première tâche si disponible */
  const premiereTache = donnees.taches[0] ?? null;
  const niveauLabel = premiereTache?.niveau.label;
  const disciplineLabel = premiereTache?.discipline.label;

  // Vue détaillée inline = aperçu rapide en mode FIXE sommatif-standard
  // (spec §7.2). La modale carrousel (bouton imprimante) est l'outil de
  // configuration complet où l'utilisateur peut changer mode + corrigé.
  const payloadImpression = useMemo(
    () =>
      ({
        type: "epreuve",
        donnees: donnees,
        mode: "sommatif-standard",
        corrige: null,
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
        onglets={
          <Onglets
            ongletActif={ongletActif}
            surChangerOnglet={setOngletActif}
            actions={
              ongletActif === "apercu-imprime" ? (
                <SegmentedControl
                  aria-label="Feuillet"
                  options={optionsFeuillets}
                  value={feuilletActif}
                  onChange={(v) => setFeuilletActif(v as TypeFeuillet)}
                />
              ) : null
            }
          />
        }
        contenuPrincipal={
          ongletActif === "sommaire" ? (
            <SectionPileTaches taches={donnees.taches} />
          ) : (
            <ApercuImprimeInline payload={payloadImpression} feuilletActif={feuilletActif} />
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
