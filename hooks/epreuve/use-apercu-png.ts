"use client";

import { useCallback, useRef, useState } from "react";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression, TypeFeuillet } from "@/lib/epreuve/pagination/types";
import { epreuveVersPaginee } from "@/lib/epreuve/transformation/epreuve-vers-paginee";

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

/* -------------------------------------------------------------------------- */
/*  Mesureur placeholder (cohérent avec la route SSR et l'API apercu-png)     */
/* -------------------------------------------------------------------------- */

function mesureurPlaceholder(): number {
  return 200;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Orchestre le flux complet : token-draft -> apercu-png -> affichage carrousel.
 * Calcule aussi l'empreinte wizard locale pour la détection d'invalidation.
 */
export function useApercuPng(
  epreuve: DonneesEpreuve,
  mode: ModeImpression,
  estCorrige: boolean,
): UseApercuPngRetour {
  const [etat, setEtat] = useState<EtatApercu>({ statut: "idle" });
  const [pdfEnCours, setPdfEnCours] = useState(false);
  const tokenRef = useRef<string | null>(null);

  // Empreinte wizard locale (recalculée à chaque render via epreuveVersPaginee)
  const paginee = epreuveVersPaginee(epreuve, { mode, estCorrige }, mesureurPlaceholder);
  const empreinteWizard = paginee.ok ? paginee.empreinte : "";

  // Détection d'invalidation
  const estInvalide =
    etat.statut === "pret" && empreinteWizard !== "" && etat.empreintePng !== empreinteWizard;

  /** Calcule le nombre de pages par feuillet depuis la pagination locale. */
  function calculerPagesParFeuillet(): Record<TypeFeuillet, number> {
    if (!paginee.ok) {
      return { "dossier-documentaire": 0, questionnaire: 0, "cahier-reponses": 0 };
    }
    return {
      "dossier-documentaire": paginee.feuillets["dossier-documentaire"].length,
      questionnaire: paginee.feuillets["questionnaire"].length,
      "cahier-reponses": paginee.feuillets["cahier-reponses"].length,
    };
  }

  /** Obtient un token draft depuis l'API. */
  async function obtenirToken(): Promise<string> {
    const res = await fetch("/api/impression/token-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: epreuve, mode, estCorrige }),
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
      const pagesParFeuillet = calculerPagesParFeuillet();

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
  }, [epreuve, mode, estCorrige]);

  const telechargerPdf = useCallback(async () => {
    setPdfEnCours(true);
    try {
      // Réutiliser le token existant ou en obtenir un nouveau
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
      a.download = "epreuve.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // L'erreur PDF est silencieuse — le toast est géré par le composant appelant si nécessaire
    } finally {
      setPdfEnCours(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epreuve, mode, estCorrige]);

  return { etat, empreinteWizard, estInvalide, generer, telechargerPdf, pdfEnCours };
}
