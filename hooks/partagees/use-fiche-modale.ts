"use client";

import { useState, useCallback, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────── */

type FicheModaleKind = "document";

type FicheModaleTarget = {
  kind: FicheModaleKind;
  id: string;
};

type FicheModaleState = { ouvert: false } | { ouvert: true; cible: FicheModaleTarget };

/* ─── Hook ───────────────────────────────────────────────────── */

/**
 * Gère l'état global de la modale fiche (un seul modal actif à la fois).
 * Expose `ouvrirFicheModale`, `fermerFicheModale`, et l'état courant.
 *
 * Le hook gère également la restauration du focus sur l'élément déclencheur
 * à la fermeture du modal (a11y).
 */
export function useFicheModale() {
  const [etat, setEtat] = useState<FicheModaleState>({ ouvert: false });

  /** Référence vers l'élément qui a déclenché l'ouverture (focus restore). */
  const declencheurRef = useRef<HTMLElement | null>(null);

  const ouvrirFicheModale = useCallback((cible: FicheModaleTarget) => {
    declencheurRef.current = document.activeElement as HTMLElement | null;
    setEtat({ ouvert: true, cible });
  }, []);

  const fermerFicheModale = useCallback(() => {
    setEtat({ ouvert: false });
    /* Restaurer le focus sur le déclencheur après un tick (le DOM du modal disparaît). */
    requestAnimationFrame(() => {
      declencheurRef.current?.focus();
      declencheurRef.current = null;
    });
  }, []);

  return {
    modaleOuverte: etat.ouvert,
    cibleModale: etat.ouvert ? etat.cible : null,
    ouvrirFicheModale,
    fermerFicheModale,
  } as const;
}
