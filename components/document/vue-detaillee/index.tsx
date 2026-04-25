"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { ApercuImprimeInline } from "@/components/partagees/vue-detaillee/apercu-imprime";
import { CarrouselApercuModale } from "@/components/partagees/carrousel-apercu/modale";
import { SectionContenu } from "@/components/document/vue-detaillee/sections/contenu";
import { DocumentRail } from "@/components/document/vue-detaillee/rail";
import { useRetourContextuel } from "@/hooks/partagees/use-retour-contextuel";
import { useCopierLien } from "@/hooks/partagees/use-copier-lien";
import type { DocFicheData } from "@/lib/fiche/types";

type Props = {
  data: DocFicheData;
  estAuteur: boolean;
  estEpinglee?: boolean;
  layout?: "sidebar" | "stacked";
  surModifier?: () => void;
  surEpingler?: () => void;
  surSupprimer?: () => void;
};

/**
 * Vue détaillée document — layout partagé avec onglets Sommaire / Aperçu imprimé.
 * INV-R4 : même composant en page complète (sidebar) et en panneau (stacked).
 */
export function DocumentVueDetaillee({
  data,
  estAuteur,
  estEpinglee = false,
  layout = "sidebar",
  surModifier,
  surEpingler,
  surSupprimer,
}: Props) {
  const router = useRouter();
  const [ongletActif, setOngletActif] = useState<OngletId>("sommaire");
  const [carrouselOuvert, setCarrouselOuvert] = useState(false);
  const retour = useRetourContextuel();
  const { copierLien } = useCopierLien();

  const payloadImpression = useMemo(
    () => ({ type: "document", donnees: data.document }) as const,
    [data.document],
  );

  return (
    <>
      <VueDetailleeLayout
        layout={layout}
        barreActions={
          <BarreActions
            estAuteur={estAuteur}
            estEpinglee={estEpinglee}
            entite="document"
            retour={retour}
            surModifier={surModifier ?? (() => router.push(`/documents/${data.document.id}/edit`))}
            surEpingler={
              surEpingler ??
              (() => {
                /* TODO */
              })
            }
            surCopierLien={copierLien}
            surOuvrirVisionneuse={() => setCarrouselOuvert(true)}
            surSupprimer={
              surSupprimer ??
              (() => {
                /* TODO */
              })
            }
            layout={layout}
          />
        }
        onglets={<Onglets ongletActif={ongletActif} surChangerOnglet={setOngletActif} />}
        contenuPrincipal={
          ongletActif === "sommaire" ? (
            <SectionContenu document={data.document} />
          ) : (
            <ApercuImprimeInline payload={payloadImpression} />
          )
        }
        rail={<DocumentRail data={data} />}
      />

      <CarrouselApercuModale
        open={carrouselOuvert}
        onClose={() => setCarrouselOuvert(false)}
        payload={payloadImpression}
      />
    </>
  );
}
