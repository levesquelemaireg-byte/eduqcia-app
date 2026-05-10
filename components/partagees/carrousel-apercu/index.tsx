"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { TypeFeuillet } from "@/lib/epreuve/pagination/types";
import { CARROUSEL_APERCU_COPY, FEUILLET_LABELS_COPY } from "./copy";
import { useCarrouselNavSetter } from "./nav-context";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

export type FeuilletInfo = {
  type: TypeFeuillet;
  label: string;
  pages: string[];
  debutIndex: number;
};

export type CarrouselApercuProps = {
  /** PNG pages en base64 (ordonnées : dossier-documentaire, questionnaire, cahier-reponses). */
  pages: string[];
  /** Nombre de pages par feuillet (depuis la pagination locale). */
  pagesParFeuillet: Record<TypeFeuillet, number>;
  /** Empreinte FNV-1a des PNG affichés (key React pour bust de cache). */
  empreintePng: string;
  /** Feuillet actuellement affiché — contrôlé par le parent. */
  feuilletActif: TypeFeuillet;
};

/* -------------------------------------------------------------------------- */
/*  Construction des feuillets actifs                                         */
/* -------------------------------------------------------------------------- */

/**
 * Liste les feuillets non vides (au moins une page) avec leur tranche
 * de pages PNG. Exporté pour permettre au parent (modale carrousel) de
 * construire les onglets feuillets et savoir s'il faut les afficher.
 */
export function construireFeuillets(
  pages: string[],
  pagesParFeuillet: Record<TypeFeuillet, number>,
): FeuilletInfo[] {
  const feuillets: FeuilletInfo[] = [];
  let offset = 0;

  for (const type of ORDRE_FEUILLETS) {
    const count = pagesParFeuillet[type];
    if (count > 0) {
      feuillets.push({
        type,
        label: FEUILLET_LABELS_COPY[type],
        pages: pages.slice(offset, offset + count),
        debutIndex: offset,
      });
      offset += count;
    }
  }

  return feuillets;
}

/* -------------------------------------------------------------------------- */
/*  Sous-composant : carrousel Embla pour un feuillet                         */
/* -------------------------------------------------------------------------- */

function CarrouselFeuillet({
  feuillet,
  totalPagesGlobal,
  empreintePng,
}: {
  feuillet: FeuilletInfo;
  totalPagesGlobal: number;
  empreintePng: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    startIndex: 0,
  });
  const [indexActif, setIndexActif] = useState(0);
  // Setter stable (référence ne change jamais) — pas de boucle de
  // re-render même si on l'utilise comme dépendance du useEffect.
  const setNavControls = useCarrouselNavSetter();

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => {
      setIndexActif(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", handler);
    emblaApi.on("init", handler);
    return () => {
      emblaApi.off("select", handler);
      emblaApi.off("init", handler);
    };
  }, [emblaApi]);

  // Expose les controls au Context (consommé par le footer de la modale).
  useEffect(() => {
    if (!emblaApi) return;
    setNavControls({
      scrollPrev: () => emblaApi.scrollPrev(),
      scrollNext: () => emblaApi.scrollNext(),
      indexPageGlobal: feuillet.debutIndex + indexActif + 1,
      totalPagesGlobal,
      peutPrecedent: indexActif > 0,
      peutSuivant: indexActif < feuillet.pages.length - 1,
    });
    return () => {
      setNavControls(null);
    };
  }, [
    setNavControls,
    emblaApi,
    indexActif,
    feuillet.debutIndex,
    feuillet.pages.length,
    totalPagesGlobal,
  ]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {feuillet.pages.map((pageBase64, i) => {
          const estActif = i === indexActif;
          const pageNum = feuillet.debutIndex + i + 1;
          return (
            <div
              key={`${feuillet.type}-${i}-${empreintePng}`}
              className={cn(
                "min-w-0 flex-[0_0_100%] px-2 transition-[filter,opacity] duration-200",
                !estActif && "opacity-40 blur-[2px]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, Next Image n'optimise pas */}
              <img
                src={`data:image/png;base64,${pageBase64}`}
                alt={CARROUSEL_APERCU_COPY.altImage(pageNum, totalPagesGlobal, feuillet.label)}
                className="mx-auto w-full max-w-204 rounded shadow-sm"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Composant principal                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Carrousel des pages d'un feuillet — composant pur de rendu.
 *
 * Le state du feuillet actif et les onglets de navigation sont remontés
 * dans le parent (modale carrousel) pour s'intégrer au flux DOM de la
 * modale (header → onglets → contenu → footer).
 */
export function CarrouselApercu({
  pages,
  pagesParFeuillet,
  empreintePng,
  feuilletActif,
}: CarrouselApercuProps) {
  const feuillets = construireFeuillets(pages, pagesParFeuillet);
  const feuillet = feuillets.find((f) => f.type === feuilletActif) ?? feuillets[0] ?? null;

  if (!feuillet) return null;

  return (
    <div role="tabpanel" className="min-h-0 flex-1 overflow-hidden">
      <CarrouselFeuillet
        key={feuillet.type}
        feuillet={feuillet}
        totalPagesGlobal={pages.length}
        empreintePng={empreintePng}
      />
    </div>
  );
}
