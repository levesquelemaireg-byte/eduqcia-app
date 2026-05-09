"use client";

import { useEffect, useMemo } from "react";
import { useApercuPng, type PayloadImpression } from "@/hooks/partagees/use-apercu-png";
import { Button } from "@/components/ui/Button";
import { CARROUSEL_APERCU_COPY } from "@/components/partagees/carrousel-apercu/copy";
import type { TypeFeuillet } from "@/lib/epreuve/pagination/types";

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

type Props = {
  payload: PayloadImpression;
  /**
   * Filtre l'affichage à un seul feuillet (utilisé par la vue détaillée
   * épreuve en sommatif-standard, où les toggles de feuillets vivent dans
   * la barre supérieure des onglets parents). Si omis, toutes les pages
   * sont affichées en flux continu (cas tâche formatif — un seul feuillet).
   */
  feuilletActif?: TypeFeuillet;
};

/**
 * Calcule l'offset de début et le nombre de pages d'un feuillet donné
 * dans la liste plate de pages PNG (ordonnées dossier-doc → questionnaire
 * → cahier-réponses).
 */
function tranchePages(
  feuillet: TypeFeuillet,
  pagesParFeuillet: Record<TypeFeuillet, number>,
): { debut: number; fin: number } {
  let debut = 0;
  for (const f of ORDRE_FEUILLETS) {
    if (f === feuillet) return { debut, fin: debut + pagesParFeuillet[f] };
    debut += pagesParFeuillet[f];
  }
  return { debut: 0, fin: 0 };
}

/**
 * Contenu inline de l'onglet « Aperçu de l'imprimé » des vues détaillées.
 *
 * Mode FIXE (formatif pour tâche, sommatif-standard pour épreuve — décidé
 * par le parent). L'export PDF et la configuration des modes vivent dans
 * la modale carrousel (bouton imprimante de la barre d'actions).
 *
 * Pour épreuve sommatif, le parent gère le state `feuilletActif` et passe
 * la valeur courante. Les toggles de feuillets sont rendus dans la barre
 * des onglets parente, pas dans ce composant.
 */
export function ApercuImprimeInline({ payload, feuilletActif }: Props) {
  const { etat, generer } = useApercuPng(payload);

  /* Génération automatique au montage */
  useEffect(() => {
    if (etat.statut === "idle") {
      generer();
    }
  }, [etat.statut, generer]);

  const pagesAffichees = useMemo<string[]>(() => {
    if (etat.statut !== "pret") return [];
    if (!feuilletActif) return etat.pages;
    const { debut, fin } = tranchePages(feuilletActif, etat.pagesParFeuillet);
    return etat.pages.slice(debut, fin);
  }, [etat, feuilletActif]);

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

  /* Prêt — pages du feuillet actif (ou toutes si non filtré) empilées. */
  return (
    <div className="mx-auto max-w-150 space-y-4">
      {pagesAffichees.map((pageBase64, i) => (
        <div key={i} className="overflow-hidden rounded-md border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, Next Image n'optimise pas */}
          <img
            src={`data:image/png;base64,${pageBase64}`}
            alt={CARROUSEL_APERCU_COPY.altImage(i + 1, pagesAffichees.length, "")}
            className="w-full"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
