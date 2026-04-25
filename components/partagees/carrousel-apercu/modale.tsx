"use client";

import { useEffect, useId } from "react";
import { useApercuPng, type PayloadImpression } from "@/hooks/partagees/use-apercu-png";
import { Button } from "@/components/ui/Button";
import { CarrouselApercu } from "./index";
import { CARROUSEL_APERCU_COPY } from "./copy";
import { CarrouselNavProvider, useCarrouselNavControls } from "./nav-context";

export type CarrouselApercuModaleProps = {
  open: boolean;
  onClose: () => void;
  payload: PayloadImpression;
};

/**
 * Overlay modal partagé — bouton imprimante des vues détaillées
 * (tâche, document, épreuve). Génère les PNG via `useApercuPng`
 * et les présente dans `CarrouselApercu` avec chrome modal
 * (header, fermeture, footer télécharger PDF + navigation prev/next).
 */
export function CarrouselApercuModale({ open, onClose, payload }: CarrouselApercuModaleProps) {
  const titleId = useId();
  const { etat, empreinteWizard, generer, telechargerPdf, pdfEnCours } = useApercuPng(payload);

  // Génération automatique à l'ouverture
  useEffect(() => {
    if (open && etat.statut === "idle") {
      generer();
    }
  }, [open, etat.statut, generer]);

  // Verrou scroll body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <CarrouselNavProvider>
      <div className="fixed inset-0 z-50 flex flex-col" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label={CARROUSEL_APERCU_COPY.boutonFermer}
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative z-10 flex min-h-0 flex-1 flex-col bg-deep/25"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-4 py-3 shadow-sm sm:px-5">
            <h2 id={titleId} className="text-lg font-semibold text-deep">
              {CARROUSEL_APERCU_COPY.modalTitle}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep"
              aria-label={CARROUSEL_APERCU_COPY.boutonFermer}
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                close
              </span>
            </button>
          </header>

          {/* Contenu principal — overflow-hidden, pas de scroll vertical. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-steel/25 px-4 py-6 sm:px-8">
            {etat.statut === "chargement" && <SqueletteChargement />}

            {etat.statut === "erreur" && (
              <EtatErreur message={etat.message} surReessayer={generer} />
            )}

            {etat.statut === "pret" && (
              <CarrouselApercu
                pages={etat.pages}
                pagesParFeuillet={etat.pagesParFeuillet}
                empreintePng={etat.empreintePng}
                empreinteWizard={empreinteWizard}
                surRegenerer={generer}
              />
            )}
          </div>

          {/* Footer — grid 3 colonnes : nav centrée absolument, actions à droite.
              La col gauche vide équilibre la col droite (actions) pour que la
              nav soit centrée par rapport au footer entier. */}
          <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-border bg-panel px-4 py-3 sm:px-5">
            <div aria-hidden="true" />
            <FooterNavigation />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                {CARROUSEL_APERCU_COPY.boutonFermer}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={etat.statut !== "pret" || pdfEnCours}
                onClick={telechargerPdf}
              >
                {pdfEnCours ? (
                  <span className="inline-flex items-center gap-[0.35em]">
                    <span
                      className="material-symbols-outlined animate-spin text-[1em] leading-none"
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                    {CARROUSEL_APERCU_COPY.boutonTelechargerPdf}
                  </span>
                ) : (
                  CARROUSEL_APERCU_COPY.boutonTelechargerPdf
                )}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </CarrouselNavProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sous-composants internes                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Navigation prev / next + indicateur, lue depuis le Context du carrousel.
 * Boutons icône bordés (chevron_left / chevron_right), indicateur central
 * en font-semibold pour le contraste avec les boutons ghost à côté.
 */
function FooterNavigation() {
  const controls = useCarrouselNavControls();

  if (!controls) {
    return <div aria-hidden="true" />;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={controls.scrollPrev}
        disabled={!controls.peutPrecedent}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-panel text-deep transition-colors hover:border-border-secondary hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page précédente"
      >
        <span className="material-symbols-outlined text-[1.25em] leading-none" aria-hidden="true">
          chevron_left
        </span>
      </button>
      <span className="min-w-[8ch] px-2 text-center text-sm font-semibold text-deep tabular-nums">
        {CARROUSEL_APERCU_COPY.indicateurPage(controls.indexPageGlobal, controls.totalPagesGlobal)}
      </span>
      <button
        type="button"
        onClick={controls.scrollNext}
        disabled={!controls.peutSuivant}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-panel text-deep transition-colors hover:border-border-secondary hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page suivante"
      >
        <span className="material-symbols-outlined text-[1.25em] leading-none" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </div>
  );
}

function SqueletteChargement() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <span
        className="material-symbols-outlined animate-spin text-[2rem] text-accent"
        aria-hidden="true"
      >
        progress_activity
      </span>
      <p className="text-base font-semibold text-deep">{CARROUSEL_APERCU_COPY.skeletonTitre}</p>
      <p className="text-sm text-muted">{CARROUSEL_APERCU_COPY.skeletonSousTitre}</p>
    </div>
  );
}

function EtatErreur({ message, surReessayer }: { message: string; surReessayer: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-[2rem] text-error" aria-hidden="true">
        error
      </span>
      <p className="text-base font-semibold text-deep">{CARROUSEL_APERCU_COPY.erreurGeneration}</p>
      <p className="text-sm text-muted">{message}</p>
      <Button type="button" variant="secondary" onClick={surReessayer}>
        {CARROUSEL_APERCU_COPY.boutonReessayer}
      </Button>
    </div>
  );
}
