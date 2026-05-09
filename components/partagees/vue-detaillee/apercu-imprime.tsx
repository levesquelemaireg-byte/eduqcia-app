"use client";

import { useEffect, useMemo, useState } from "react";
import { useApercuPng, type PayloadImpression } from "@/hooks/partagees/use-apercu-png";
import { Button } from "@/components/ui/Button";
import {
  CARROUSEL_APERCU_COPY,
  FEUILLET_LABELS_COPY,
} from "@/components/partagees/carrousel-apercu/copy";
import type { TypeFeuillet } from "@/lib/epreuve/pagination/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  payload: PayloadImpression;
};

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

type FeuilletInfo = {
  type: TypeFeuillet;
  label: string;
  pages: string[];
};

/**
 * Construit la liste des feuillets actifs (ceux qui contiennent au moins
 * une page) avec leur tranche de pages PNG.
 */
function construireFeuillets(
  pages: string[],
  pagesParFeuillet: Record<TypeFeuillet, number>,
): FeuilletInfo[] {
  const feuillets: FeuilletInfo[] = [];
  let offset = 0;
  for (const type of ORDRE_FEUILLETS) {
    const count = pagesParFeuillet[type];
    if (count > 0) {
      feuillets.push({
        type,
        label: FEUILLET_LABELS_COPY[type],
        pages: pages.slice(offset, offset + count),
      });
      offset += count;
    }
  }
  return feuillets;
}

/**
 * Contenu inline de l'onglet « Aperçu de l'imprimé ».
 *
 * Aperçu rapide en mode FIXE (formatif pour tâche, sommatif-standard pour
 * épreuve — décidé par le parent). L'export PDF et la configuration
 * complète des modes vivent dans la modale carrousel (bouton imprimante
 * de la barre d'actions).
 *
 * Quand le rendu produit plus d'un feuillet (épreuve sommatif-standard
 * → dossier + questionnaire), on affiche des onglets de navigation entre
 * feuillets. Avec un seul feuillet (tâche formatif), pas d'onglets — flux
 * continu.
 */
export function ApercuImprimeInline({ payload }: Props) {
  const { etat, generer } = useApercuPng(payload);

  /* Génération automatique au montage */
  useEffect(() => {
    if (etat.statut === "idle") {
      generer();
    }
  }, [etat.statut, generer]);

  const feuillets = useMemo<FeuilletInfo[]>(() => {
    if (etat.statut !== "pret") return [];
    return construireFeuillets(etat.pages, etat.pagesParFeuillet);
  }, [etat]);

  const [feuilletActifIndex, setFeuilletActifIndex] = useState(0);
  const indexAffiche = Math.min(feuilletActifIndex, Math.max(0, feuillets.length - 1));
  const feuilletActif = feuillets[indexAffiche] ?? null;

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

  /* Prêt — onglets feuillets (si > 1) + pages empilées du feuillet actif. */
  return (
    <div className="space-y-4">
      {feuillets.length > 1 && (
        <div role="tablist" aria-label="Feuillets" className="flex gap-1 border-b border-border">
          {feuillets.map((f, i) => (
            <button
              key={f.type}
              type="button"
              role="tab"
              aria-selected={i === indexAffiche}
              onClick={() => setFeuilletActifIndex(i)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                i === indexAffiche
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted hover:text-deep",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {feuilletActif && (
        <div className="mx-auto max-w-150 space-y-4">
          {feuilletActif.pages.map((pageBase64, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-border shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, Next Image n'optimise pas */}
              <img
                src={`data:image/png;base64,${pageBase64}`}
                alt={CARROUSEL_APERCU_COPY.altImage(
                  i + 1,
                  feuilletActif.pages.length,
                  feuilletActif.label,
                )}
                className="w-full"
                draggable={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
