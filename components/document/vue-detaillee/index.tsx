"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VueDetailleeLayout } from "@/components/partagees/vue-detaillee/layout";
import { BarreActions } from "@/components/partagees/vue-detaillee/barre-actions";
import { Onglets, type OngletId } from "@/components/partagees/vue-detaillee/onglets";
import { SectionHero } from "@/components/document/vue-detaillee/sections/hero";
import { SectionContenu } from "@/components/document/vue-detaillee/sections/contenu";
import { DocumentRail } from "@/components/document/vue-detaillee/rail";
import { DocumentRenderer } from "@/components/document/renderer";
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
  const retour = useRetourContextuel();
  const { copierLien } = useCopierLien();

  // Extraire les labels de type/structure
  const premierElement = data.document.elements[0];
  const typeLabel = premierElement?.type === "iconographique" ? "Iconographique" : "Textuel";
  const structureLabel =
    data.document.structure === "perspectives"
      ? "Perspectives"
      : data.document.structure === "deux_temps"
        ? "Deux temps"
        : "Simple";

  return (
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
          surOuvrirVisionneuse={() => {
            /* TODO: visionneuse document */
          }}
          surSupprimer={
            surSupprimer ??
            (() => {
              /* TODO */
            })
          }
          layout={layout}
        />
      }
      header={
        <SectionHero
          titre={data.document.titre}
          estPublie={data.isPublished}
          typeLabel={typeLabel}
          structureLabel={structureLabel}
          niveauLabels={data.niveauLabels}
          disciplineLabels={data.disciplineLabels}
        />
      }
      onglets={<Onglets ongletActif={ongletActif} surChangerOnglet={setOngletActif} />}
      contenuPrincipal={
        ongletActif === "sommaire" ? (
          <SectionContenu document={data.document} />
        ) : (
          <div className="space-y-3">
            {/* Aperçu imprimé — rendu canonique via DocumentRenderer */}
            <div className="mx-auto max-w-[600px]">
              <div className="border border-deep">
                <DocumentRenderer document={data.document} mode="sommaire" numero={1} />
              </div>
            </div>
            <p className="text-center text-[11px] text-muted">
              Le numéro <span className="font-medium">1</span> est provisoire. Il sera recalculé
              selon le rang du document dans chaque épreuve.
            </p>
          </div>
        )
      }
      rail={<DocumentRail data={data} />}
    />
  );
}
