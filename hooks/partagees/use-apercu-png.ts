"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression, TypeFeuillet } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";
import type { RendererDocument } from "@/lib/types/document-renderer";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import { documentVersImprimable } from "@/lib/document/impression/document-vers-imprimable";
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

/** Payload discriminé pour le hook : document, tâche ou épreuve. */
export type PayloadImpression =
  | { type: "document"; donnees: RendererDocument }
  | { type: "tache"; donnees: DonneesTache; mode: ModeImpression; estCorrige: boolean }
  | { type: "epreuve"; donnees: DonneesEpreuve; mode: ModeImpression; estCorrige: boolean };

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
function calculerRendu(payload: PayloadImpression): RenduImprimable {
  switch (payload.type) {
    case "document":
      return documentVersImprimable(payload.donnees, mesurerBlocImpression);
    case "tache":
      return tacheVersImprimable(
        payload.donnees,
        { mode: payload.mode, estCorrige: payload.estCorrige },
        mesurerBlocImpression,
      );
    case "epreuve":
      return epreuveVersImprimable(
        payload.donnees,
        { mode: payload.mode, estCorrige: payload.estCorrige },
        mesurerBlocImpression,
      );
  }
}

/** Construit le body pour POST /api/impression/token-draft. */
function construireBodyTokenDraft(payload: PayloadImpression): unknown {
  switch (payload.type) {
    case "document":
      return { type: "document", payload: payload.donnees };
    case "tache":
      return {
        type: "tache",
        payload: payload.donnees,
        mode: payload.mode,
        estCorrige: payload.estCorrige,
      };
    case "epreuve":
      return {
        type: "epreuve",
        payload: payload.donnees,
        mode: payload.mode,
        estCorrige: payload.estCorrige,
      };
  }
}

function nomFichierPdf(type: PayloadImpression["type"]): string {
  switch (type) {
    case "document":
      return "document.pdf";
    case "tache":
      return "tache.pdf";
    case "epreuve":
      return "epreuve.pdf";
  }
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Orchestre le flux complet : token-draft → apercu-png → affichage carrousel.
 * Calcule aussi l'empreinte locale pour la détection d'invalidation.
 *
 * Supporte les payloads document, tâche et épreuve via `PayloadImpression`.
 * Pour les tâches et épreuves, `mode` et `estCorrige` font partie du payload.
 */
export function useApercuPng(payload: PayloadImpression): UseApercuPngRetour {
  const [etat, setEtat] = useState<EtatApercu>({ statut: "idle" });
  const [pdfEnCours, setPdfEnCours] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const estEnCoursRef = useRef(false);

  const rendu = useMemo(() => calculerRendu(payload), [payload]);
  const empreinteWizard = rendu.ok ? rendu.empreinte : "";

  // Détection d'invalidation
  const estInvalide =
    etat.statut === "pret" && empreinteWizard !== "" && etat.empreintePng !== empreinteWizard;

  // Reset tokenRef au changement de payload
  useEffect(() => {
    tokenRef.current = null;
  }, [payload]);

  // Cleanup AbortController au démontage
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
      body: JSON.stringify(construireBodyTokenDraft(payload)),
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
      // Guard anti double-clic
      if (estEnCoursRef.current) return;
      estEnCoursRef.current = true;

      // AbortController
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Timeout PNG 45s (Puppeteer côté API = 30s + marge réseau)
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

        // Retry sur token expiré (410)
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

    // Timeout PDF 30s
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
      a.download = nomFichierPdf(payload.type);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
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
