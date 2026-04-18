"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression, TypeFeuillet } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import { mesurerBlocImpression } from "@/lib/impression/mesure-estimation";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type EtatApercu =
  | { statut: "idle" }
  | { statut: "chargement" }
  | {
      statut: "pret";
      pages: string[];
      empreintePng: string;
      pagesParFeuillet: Record<TypeFeuillet, number>;
    }
  | { statut: "erreur"; message: string };

export type UseApercuPngRetour = {
  etat: EtatApercu;
  empreinteWizard: string;
  estInvalide: boolean;
  generer: () => Promise<void>;
  telechargerPdf: () => Promise<void>;
  pdfEnCours: boolean;
};

/** Payload discriminé pour le hook : tâche ou épreuve. */
export type PayloadImpression =
  | { type: "tache"; donnees: DonneesTache }
  | { type: "epreuve"; donnees: DonneesEpreuve };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Calcule le nombre de pages par feuillet depuis les pages plates. */
function extrairePagesParFeuillet(
  rendu: RenduImprimable & { ok: true },
): Record<TypeFeuillet, number> {
  const counts: Record<TypeFeuillet, number> = {
    "dossier-documentaire": 0,
    questionnaire: 0,
    "cahier-reponses": 0,
  };
  for (const page of rendu.pages) {
    counts[page.feuillet]++;
  }
  return counts;
}

/** Calcule le RenduImprimable pour l'empreinte locale. */
function calculerRendu(
  payload: PayloadImpression,
  mode: ModeImpression,
  estCorrige: boolean,
): RenduImprimable {
  switch (payload.type) {
    case "tache":
      return tacheVersImprimable(payload.donnees, { mode, estCorrige }, mesurerBlocImpression);
    case "epreuve":
      return epreuveVersImprimable(payload.donnees, { mode, estCorrige }, mesurerBlocImpression);
  }
}

/** Construit le body pour POST /api/impression/token-draft. */
function construireBodyTokenDraft(
  payload: PayloadImpression,
  mode: ModeImpression,
  estCorrige: boolean,
): unknown {
  switch (payload.type) {
    case "tache":
      return { type: "tache", payload: payload.donnees, mode, estCorrige };
    case "epreuve":
      return { type: "epreuve", payload: payload.donnees, mode, estCorrige };
  }
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Orchestre le flux complet : token-draft -> apercu-png -> affichage carrousel.
 * Calcule aussi l'empreinte wizard locale pour la détection d'invalidation.
 *
 * Supporte les payloads tâche et épreuve via `PayloadImpression`.
 */
export function useApercuPng(
  payload: PayloadImpression,
  mode: ModeImpression,
  estCorrige: boolean,
): UseApercuPngRetour {
  const [etat, setEtat] = useState<EtatApercu>({ statut: "idle" });
  const [pdfEnCours, setPdfEnCours] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const estEnCoursRef = useRef(false);

  // Correctif 5 — useMemo sur calculerRendu
  const rendu = useMemo(
    () => calculerRendu(payload, mode, estCorrige),
    [payload, mode, estCorrige],
  );
  const empreinteWizard = rendu.ok ? rendu.empreinte : "";

  // Détection d'invalidation
  const estInvalide =
    etat.statut === "pret" && empreinteWizard !== "" && etat.empreintePng !== empreinteWizard;

  // Correctif 4 — Reset tokenRef au changement de deps
  useEffect(() => {
    tokenRef.current = null;
  }, [payload, mode, estCorrige]);

  // Correctif 1 — Cleanup AbortController au démontage
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      estEnCoursRef.current = false;
      tokenRef.current = null;
    };
  }, []);

  /** Obtient un token draft depuis l'API. Stabilisé via ref pour éviter les deps cycliques. */
  const obtenirTokenRef = useRef<(signal?: AbortSignal) => Promise<string>>(() => Promise.reject());
  obtenirTokenRef.current = async (signal?: AbortSignal) => {
    const res = await fetch("/api/impression/token-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(construireBodyTokenDraft(payload, mode, estCorrige)),
      signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
    }
    const data = (await res.json()) as { token: string };
    return data.token;
  };

  const generer = useCallback(
    async (tentative = 1) => {
      // Correctif 6 — Guard anti double-clic
      if (estEnCoursRef.current) return;
      estEnCoursRef.current = true;

      // Correctif 1 — AbortController
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Correctif 8 — Timeout PNG 45s (Puppeteer côté API = 30s + marge réseau)
      let estTimeout = false;
      const timeout = setTimeout(() => {
        estTimeout = true;
        controller.abort();
      }, 45_000);

      setEtat({ statut: "chargement" });
      try {
        const token = await obtenirTokenRef.current(controller.signal);
        tokenRef.current = token;

        const res = await fetch("/api/impression/apercu-png", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        });

        // Correctif 3 — Retry sur token expiré (410)
        if (res.status === 410 && tentative < 2) {
          tokenRef.current = null;
          estEnCoursRef.current = false;
          return generer(tentative + 1);
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
        }

        const data = (await res.json()) as { pages: string[]; empreinte: string };

        // Correctif 5 — utiliser le rendu mémoïsé
        const pagesParFeuillet = rendu.ok
          ? extrairePagesParFeuillet(rendu)
          : { "dossier-documentaire": 0, questionnaire: 0, "cahier-reponses": 0 };

        setEtat({
          statut: "pret",
          pages: data.pages,
          empreintePng: data.empreinte,
          pagesParFeuillet,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          if (estTimeout) {
            // Correctif 8 — Timeout atteint, afficher l'erreur
            setEtat({
              statut: "erreur",
              message: "La génération a pris trop de temps. Réessayez.",
            });
          } else {
            // Abort volontaire (strict mode, unmount/remount, annulation locale) :
            // remettre l'état à idle pour permettre une relance propre.
            if (abortRef.current === null || abortRef.current === controller) {
              setEtat((prev) => (prev.statut === "chargement" ? { statut: "idle" } : prev));
            }
          }
          return;
        }
        const message = err instanceof Error ? err.message : "Erreur inconnue.";
        setEtat({ statut: "erreur", message });
      } finally {
        clearTimeout(timeout);
        if (abortRef.current === controller) abortRef.current = null;
        estEnCoursRef.current = false;
      }
    },
    [rendu],
  );

  const telechargerPdf = useCallback(async () => {
    setPdfEnCours(true);

    // Correctif 2 — Timeout PDF 30s
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      let token = tokenRef.current;
      if (!token) {
        token = await obtenirTokenRef.current(controller.signal);
        tokenRef.current = token;
      }

      const res = await fetch("/api/impression/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = payload.type === "tache" ? "tache.pdf" : "epreuve.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Correctif 7 — Toast erreur PDF
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("Le téléchargement a pris trop de temps. Réessayez.");
        return;
      }
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(`Échec du téléchargement : ${message}`);
      console.error("Erreur téléchargement PDF", err);
    } finally {
      clearTimeout(timeout);
      setPdfEnCours(false);
    }
  }, [payload.type]);

  return { etat, empreinteWizard, estInvalide, generer, telechargerPdf, pdfEnCours };
}
