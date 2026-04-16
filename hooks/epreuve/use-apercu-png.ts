"use client";

import { useCallback, useRef, useState } from "react";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { ModeImpression, TypeFeuillet } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";

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
/*  Mesureur placeholder (cohérent avec la route SSR et l'API apercu-png)     */
/* -------------------------------------------------------------------------- */

function mesureurPlaceholder(): number {
  return 200;
}

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
      return tacheVersImprimable(payload.donnees, { mode, estCorrige }, mesureurPlaceholder);
    case "epreuve":
      return epreuveVersImprimable(payload.donnees, { mode, estCorrige }, mesureurPlaceholder);
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

  // Empreinte wizard locale
  const rendu = calculerRendu(payload, mode, estCorrige);
  const empreinteWizard = rendu.ok ? rendu.empreinte : "";

  // Détection d'invalidation
  const estInvalide =
    etat.statut === "pret" && empreinteWizard !== "" && etat.empreintePng !== empreinteWizard;

  /** Obtient un token draft depuis l'API. */
  async function obtenirToken(): Promise<string> {
    const res = await fetch("/api/impression/token-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(construireBodyTokenDraft(payload, mode, estCorrige)),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
    }
    const data = (await res.json()) as { token: string };
    return data.token;
  }

  const generer = useCallback(async () => {
    setEtat({ statut: "chargement" });
    try {
      const token = await obtenirToken();
      tokenRef.current = token;

      const res = await fetch("/api/impression/apercu-png", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
      }

      const data = (await res.json()) as { pages: string[]; empreinte: string };

      // Calculer pagesParFeuillet depuis le rendu local
      const renduLocal = calculerRendu(payload, mode, estCorrige);
      const pagesParFeuillet = renduLocal.ok
        ? extrairePagesParFeuillet(renduLocal)
        : { "dossier-documentaire": 0, questionnaire: 0, "cahier-reponses": 0 };

      setEtat({
        statut: "pret",
        pages: data.pages,
        empreintePng: data.empreinte,
        pagesParFeuillet,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      setEtat({ statut: "erreur", message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, mode, estCorrige]);

  const telechargerPdf = useCallback(async () => {
    setPdfEnCours(true);
    try {
      let token = tokenRef.current;
      if (!token) {
        token = await obtenirToken();
        tokenRef.current = token;
      }

      const res = await fetch("/api/impression/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
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
    } catch {
      // L'erreur PDF est silencieuse
    } finally {
      setPdfEnCours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, mode, estCorrige]);

  return { etat, empreinteWizard, estInvalide, generer, telechargerPdf, pdfEnCours };
}
