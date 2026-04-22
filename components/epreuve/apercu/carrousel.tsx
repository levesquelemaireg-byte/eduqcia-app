"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { TypeFeuillet } from "@/lib/epreuve/pagination/types";
import {
  CARROUSEL_APERCU_COPY,
  EVAL_PRINT_SECTION_COPY,
} from "@/components/tache/wizard/preview/wizard-print-preview-copy";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type FeuilletInfo = {
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
  /** Empreinte FNV-1a des PNG affichés. */
  empreintePng: string;
  /** Empreinte FNV-1a calculée localement depuis le wizard. */
  empreinteWizard: string;
  /** Callback pour regénérer les PNG. */
  surRegenerer: () => void;
};

/* -------------------------------------------------------------------------- */
/*  Labels feuillets                                                          */
/* -------------------------------------------------------------------------- */

const LABELS_FEUILLETS: Record<TypeFeuillet, string> = {
  "dossier-documentaire": EVAL_PRINT_SECTION_COPY.dossierDocumentaire,
  questionnaire: EVAL_PRINT_SECTION_COPY.questionnaire,
  "cahier-reponses": "Cahier de réponses",
};

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

/* -------------------------------------------------------------------------- */
/*  Construction des feuillets actifs                                         */
/* -------------------------------------------------------------------------- */

function construireFeuillets(
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
        label: LABELS_FEUILLETS[type],
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
  indexInitial = 0,
  surChangementPage,
}: {
  feuillet: FeuilletInfo;
  totalPagesGlobal: number;
  empreintePng: string;
  indexInitial?: number;
  surChangementPage?: (type: TypeFeuillet, index: number) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    startIndex: indexInitial,
  });
  const [indexActif, setIndexActif] = useState(indexInitial);

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => {
      const idx = emblaApi.selectedScrollSnap();
      setIndexActif(idx);
      surChangementPage?.(feuillet.type, idx);
    };
    emblaApi.on("select", handler);
    emblaApi.on("init", handler);
    return () => {
      emblaApi.off("select", handler);
      emblaApi.off("init", handler);
    };
  }, [emblaApi, feuillet.type, surChangementPage]);

  const allerPrecedent = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const allerSuivant = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const pageGlobale = feuillet.debutIndex + indexActif + 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Carrousel */}
      <div className="overflow-hidden rounded-md border border-border" ref={emblaRef}>
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
                  className="mx-auto w-full max-w-[816px] rounded shadow-sm"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      {feuillet.pages.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={allerPrecedent}
            disabled={indexActif === 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Page précédente"
          >
            <span
              className="material-symbols-outlined text-[1.25em] leading-none"
              aria-hidden="true"
            >
              chevron_left
            </span>
          </button>
          <span className="text-sm font-medium text-muted">
            {CARROUSEL_APERCU_COPY.indicateurPage(pageGlobale, totalPagesGlobal)}
          </span>
          <button
            type="button"
            onClick={allerSuivant}
            disabled={indexActif === feuillet.pages.length - 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Page suivante"
          >
            <span
              className="material-symbols-outlined text-[1.25em] leading-none"
              aria-hidden="true"
            >
              chevron_right
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Composant principal                                                       */
/* -------------------------------------------------------------------------- */

export function CarrouselApercu({
  pages,
  pagesParFeuillet,
  empreintePng,
  empreinteWizard,
  surRegenerer,
}: CarrouselApercuProps) {
  const feuillets = construireFeuillets(pages, pagesParFeuillet);
  const [feuilletActifIndex, setFeuilletActifIndex] = useState(0);
  const feuilletActif = feuillets[feuilletActifIndex] ?? feuillets[0];

  // BUG-4 — Persistance de la position par feuillet au changement d'onglet
  const positionsRef = useRef<Partial<Record<TypeFeuillet, number>>>({});
  const [indexInitialActuel, setIndexInitialActuel] = useState(0);
  const surChangementPage = useCallback((type: TypeFeuillet, index: number) => {
    positionsRef.current[type] = index;
  }, []);

  const estInvalide = empreinteWizard !== "" && empreintePng !== empreinteWizard;

  if (feuillets.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Bannière d'invalidation */}
      {estInvalide && (
        <div className="flex items-center gap-3 rounded-md border border-warning/30 bg-warning/10 px-4 py-3">
          <span
            className="material-symbols-outlined text-[1.25em] leading-none text-warning"
            aria-hidden="true"
          >
            warning
          </span>
          <span className="flex-1 text-sm font-medium text-deep">
            {CARROUSEL_APERCU_COPY.banniereInvalidation}
          </span>
          <button
            type="button"
            onClick={surRegenerer}
            className="inline-flex items-center gap-[0.35em] rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
              refresh
            </span>
            {CARROUSEL_APERCU_COPY.boutonRegenerer}
          </button>
        </div>
      )}

      {/* Onglets feuillets */}
      {feuillets.length > 1 && (
        <div role="tablist" className="flex gap-1 border-b border-border" aria-label="Feuillets">
          {feuillets.map((f, i) => (
            <button
              key={f.type}
              type="button"
              role="tab"
              aria-selected={i === feuilletActifIndex}
              onClick={() => {
                setFeuilletActifIndex(i);
                setIndexInitialActuel(
                  positionsRef.current[feuillets[i]?.type ?? "dossier-documentaire"] ?? 0,
                );
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                i === feuilletActifIndex
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted hover:text-deep",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Carrousel du feuillet actif */}
      {feuilletActif && (
        <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto">
          <CarrouselFeuillet
            key={feuilletActif.type}
            feuillet={feuilletActif}
            totalPagesGlobal={pages.length}
            empreintePng={empreintePng}
            indexInitial={indexInitialActuel}
            surChangementPage={surChangementPage}
          />
        </div>
      )}
    </div>
  );
}
