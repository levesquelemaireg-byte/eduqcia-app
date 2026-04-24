"use client";

import { useEffect, useId } from "react";
import { useApercuPng, type PayloadImpression } from "@/hooks/partagees/use-apercu-png";
import { Button } from "@/components/ui/Button";
import { CarrouselApercu } from "./index";
import { CARROUSEL_APERCU_COPY } from "./copy";

export type CarrouselApercuModaleProps = {
  open: boolean;
  onClose: () => void;
  payload: PayloadImpression;
};

/**
 * Overlay modal partagé — bouton imprimante des vues détaillées
 * (tâche, document, épreuve). Génère les PNG via `useApercuPng`
 * et les présente dans `CarrouselApercu` avec chrome modal
 * (header, fermeture, footer télécharger PDF).
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

        {/* Contenu principal */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-steel/25 px-4 py-6 sm:px-8">
          {etat.statut === "chargement" && <SqueletteChargement />}

          {etat.statut === "erreur" && <EtatErreur message={etat.message} surReessayer={generer} />}

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

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-panel px-4 py-3 sm:px-5">
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
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sous-composants internes                                                  */
/* -------------------------------------------------------------------------- */

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
