"use client";

import { useEffect } from "react";
import { useApercuPng, type PayloadImpression } from "@/hooks/partagees/use-apercu-png";
import { CARROUSEL_APERCU_COPY } from "@/components/partagees/carrousel-apercu/copy";
import { Button } from "@/components/ui/Button";

type Props = {
  payload: PayloadImpression;
};

/**
 * Contenu inline de l'onglet « Aperçu de l'imprimé ».
 * Génère les PNG via le pipeline impression et les affiche empilés verticalement.
 * Partagé par les vues détaillées tâche, document et épreuve.
 */
export function ApercuImprimeInline({ payload }: Props) {
  const { etat, generer, telechargerPdf, pdfEnCours } = useApercuPng(payload);

  /* Génération automatique au montage */
  useEffect(() => {
    if (etat.statut === "idle") {
      generer();
    }
  }, [etat.statut, generer]);

  /* Chargement */
  if (etat.statut === "idle" || etat.statut === "chargement") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
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

  /* Erreur */
  if (etat.statut === "erreur") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <span className="material-symbols-outlined text-[2rem] text-error" aria-hidden="true">
          error
        </span>
        <p className="text-base font-semibold text-deep">
          {CARROUSEL_APERCU_COPY.erreurGeneration}
        </p>
        <p className="text-sm text-muted">{etat.message}</p>
        <Button type="button" variant="secondary" onClick={generer}>
          {CARROUSEL_APERCU_COPY.boutonReessayer}
        </Button>
      </div>
    );
  }

  /* Prêt — pages empilées verticalement */
  return (
    <div className="space-y-6">
      {/* Pages empilées */}
      <div className="mx-auto max-w-[600px] space-y-4">
        {etat.pages.map((pageBase64, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, Next Image n'optimise pas */}
            <img
              src={`data:image/png;base64,${pageBase64}`}
              alt={CARROUSEL_APERCU_COPY.altImage(i + 1, etat.pages.length, "")}
              className="w-full"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Button type="button" variant="primary" disabled={pdfEnCours} onClick={telechargerPdf}>
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
            <span className="inline-flex items-center gap-[0.35em]">
              <span
                className="material-symbols-outlined text-[1em] leading-none"
                aria-hidden="true"
              >
                download
              </span>
              {CARROUSEL_APERCU_COPY.boutonTelechargerPdf}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
