/**
 * Pager greedy first-fit 1D — print-engine v2.1 §D2.
 *
 * Module dédié et réutilisable indépendamment de la transformation métier.
 * Prend des Bloc[] + un Mesureur et retourne des Page[] ou une ErreurDebordement.
 */

import { MAX_CONTENT_HEIGHT_PX, RATIO_MAX_BLOC } from "./constantes";
import type { Bloc, BlocMesure, Page, TypeFeuillet, ErreurDebordement } from "./types";

/* -------------------------------------------------------------------------- */
/*  Type Mesureur                                                             */
/* -------------------------------------------------------------------------- */

/** Fonction de mesure de hauteur d'un bloc (injectée par le contexte d'exécution). */
export type Mesureur = (bloc: Bloc) => number;

/* -------------------------------------------------------------------------- */
/*  Mesure                                                                    */
/* -------------------------------------------------------------------------- */

/** Mesure un bloc et détermine s'il est sécurisé (ratio ≤ RATIO_MAX_BLOC). */
export function mesurerBloc(bloc: Bloc, mesureur: Mesureur): BlocMesure {
  const hauteurPx = mesureur(bloc);
  const ratio = hauteurPx / MAX_CONTENT_HEIGHT_PX;
  return {
    ...bloc,
    hauteurPx,
    ratio,
    securise: ratio <= RATIO_MAX_BLOC,
  };
}

/* -------------------------------------------------------------------------- */
/*  Vérification de débordement                                               */
/* -------------------------------------------------------------------------- */

/** Vérifie qu'aucun bloc ne déborde. Retourne la première erreur ou null. */
export function verifierDebordement(blocs: BlocMesure[]): ErreurDebordement | null {
  for (const bloc of blocs) {
    if (!bloc.securise) {
      return {
        kind: "DEBORDEMENT_BLOC",
        blocId: bloc.id,
        blocLibelle: `Bloc ${bloc.id}`,
        hauteurPx: bloc.hauteurPx,
        hauteurMaxPx: MAX_CONTENT_HEIGHT_PX,
        suggestion:
          "Réduisez le contenu de cette tâche ou découpez-la en plusieurs tâches plus courtes.",
      };
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Pagination greedy first-fit 1D                                            */
/* -------------------------------------------------------------------------- */

/**
 * Pagine les blocs mesurés en pages (greedy first-fit 1D).
 *
 * Chaque bloc est insécable (break-inside: avoid).
 * La numérotation des pages est locale au feuillet.
 */
export function paginer(blocs: BlocMesure[], feuillet: TypeFeuillet): Page[] {
  if (blocs.length === 0) return [];

  const pages: Page[] = [];
  let pageActuelle: BlocMesure[] = [];
  let hauteurActuelle = 0;

  for (const bloc of blocs) {
    if (pageActuelle.length > 0 && hauteurActuelle + bloc.hauteurPx > MAX_CONTENT_HEIGHT_PX) {
      pages.push({
        feuillet,
        numeroPage: 0,
        totalPages: 0,
        blocs: pageActuelle,
        hauteurTotalePx: hauteurActuelle,
      });
      pageActuelle = [];
      hauteurActuelle = 0;
    }
    pageActuelle.push(bloc);
    hauteurActuelle += bloc.hauteurPx;
  }

  if (pageActuelle.length > 0) {
    pages.push({
      feuillet,
      numeroPage: 0,
      totalPages: 0,
      blocs: pageActuelle,
      hauteurTotalePx: hauteurActuelle,
    });
  }

  // Numérotation
  const total = pages.length;
  pages.forEach((page, i) => {
    page.numeroPage = i + 1;
    page.totalPages = total;
  });

  return pages;
}
