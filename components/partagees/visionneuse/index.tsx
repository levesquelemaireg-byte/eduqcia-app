"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  feuillets: ReactNode[];
  surFermer: () => void;
  surTelecharger?: () => void;
  telechargerEnCours?: boolean;
};

/**
 * Visionneuse plein écran — overlay `bg-deep/95`, un feuillet à la fois.
 * Navigation flèches + clavier ← →. Embla Carousel (implémentation neuve).
 */
export function Visionneuse({ feuillets, surFermer, surTelecharger, telechargerEnCours }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    watchDrag: false,
  });

  const total = feuillets.length;

  /* Clavier : ← → Escape */
  const gererClavier = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") surFermer();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    },
    [surFermer, emblaApi],
  );

  useEffect(() => {
    window.addEventListener("keydown", gererClavier);
    return () => window.removeEventListener("keydown", gererClavier);
  }, [gererClavier]);

  /* Verrouiller scroll body */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Index courant pour pagination */
  const [indexCourant, setIndexCourant] = useIndexCourant(emblaApi);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "hsla(220, 40%, 18%, 0.95)" }}
    >
      {/* Bouton fermeture en haut à droite */}
      <div className="absolute right-4 top-4 z-10">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white/70 hover:text-white transition-colors"
          aria-label="Fermer la visionneuse"
          onClick={surFermer}
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      {/* Zone de contenu — carrousel */}
      <div className="flex flex-1 items-center justify-center overflow-hidden" ref={emblaRef}>
        <div className="flex h-full items-center">
          {feuillets.map((feuillet, i) => (
            <div
              key={i}
              className="flex h-full min-w-0 shrink-0 basis-full items-center justify-center px-8"
            >
              <div className="max-h-[calc(100vh-120px)] overflow-auto rounded bg-panel shadow-lg">
                {feuillet}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre d'outils en bas */}
      <div
        className="flex shrink-0 items-center justify-between px-6 py-3"
        style={{ background: "hsla(220, 40%, 18%, 0.8)", backdropFilter: "blur(8px)" }}
      >
        {/* Fermer */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          onClick={surFermer}
        >
          Fermer
        </button>

        {/* Pagination */}
        {total > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Feuillet précédent"
              disabled={indexCourant === 0}
              onClick={() => emblaApi?.scrollPrev()}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                chevron_left
              </span>
            </button>
            <span className="text-sm font-medium text-white tabular-nums">
              {indexCourant + 1} / {total}
            </span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Feuillet suivant"
              disabled={indexCourant === total - 1}
              onClick={() => emblaApi?.scrollNext()}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </div>
        )}

        {/* Télécharger */}
        {surTelecharger ? (
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90",
              telechargerEnCours && "opacity-70 cursor-wait",
            )}
            onClick={surTelecharger}
            disabled={telechargerEnCours}
          >
            {telechargerEnCours ? (
              <>
                <span
                  className="material-symbols-outlined animate-spin text-[1em]"
                  aria-hidden="true"
                >
                  progress_activity
                </span>
                Génération…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  download
                </span>
                Télécharger le PDF
              </>
            )}
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

/* ─── Hook interne : index courant Embla ──────────────────── */

import { useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";

function useIndexCourant(emblaApi: EmblaCarouselType | undefined): [number, (n: number) => void] {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return [index, setIndex];
}
