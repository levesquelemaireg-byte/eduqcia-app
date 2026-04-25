/**
 * Pager greedy first-fit 1D avec support du mode `exclusive-page`.
 *
 * Un bloc en mode `flow` (défaut) s'empile avec les voisins jusqu'à
 * `MAX_CONTENT_HEIGHT_PX` puis déclenche un saut de page.
 *
 * Un bloc en mode `exclusive-page` force une page dédiée : la page courante
 * est fermée (si non vide) avant de le poser seul, et la page qu'il occupe
 * est refermée immédiatement après lui — aucun bloc flow ne vient le
 * rejoindre sur la même page physique.
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

/**
 * Mesure un bloc et détermine s'il est sécurisé.
 *
 * Pour un bloc flow, le seuil est `RATIO_MAX_BLOC` (0.97) — laisse un peu de
 * marge pour absorber les dérives de rendu lors de l'empilage.
 *
 * Pour un bloc exclusive-page, le seuil est 1.0 — le bloc occupe sa page
 * entière sans empilage voisin, la marge de sécurité de 0.97 n'a pas lieu.
 */
export function mesurerBloc(bloc: Bloc, mesureur: Mesureur): BlocMesure {
  const hauteurPx = mesureur(bloc);
  const ratio = hauteurPx / MAX_CONTENT_HEIGHT_PX;
  const seuil = bloc.pagination?.mode === "exclusive-page" ? 1 : RATIO_MAX_BLOC;
  return {
    ...bloc,
    hauteurPx,
    ratio,
    securise: ratio <= seuil,
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
/*  Pagination greedy first-fit 1D + exclusive-page                           */
/* -------------------------------------------------------------------------- */

/**
 * Pagine les blocs mesurés en pages.
 *
 * Chaque bloc est insécable (`break-inside: avoid`). Un bloc marqué
 * `pagination: { mode: "exclusive-page" }` est placé seul sur sa page.
 *
 * La numérotation des pages est locale au feuillet.
 */
export function paginer(blocs: BlocMesure[], feuillet: TypeFeuillet): Page[] {
  if (blocs.length === 0) return [];

  const pages: Page[] = [];
  let pageActuelle: BlocMesure[] = [];
  let hauteurActuelle = 0;

  const fermerPage = () => {
    if (pageActuelle.length === 0) return;
    pages.push({
      feuillet,
      numeroPage: 0,
      totalPages: 0,
      blocs: pageActuelle,
      hauteurTotalePx: hauteurActuelle,
    });
    pageActuelle = [];
    hauteurActuelle = 0;
  };

  for (const bloc of blocs) {
    if (bloc.pagination?.mode === "exclusive-page") {
      // Ferme la page courante avant de poser un bloc exclusif.
      fermerPage();
      // Place le bloc seul sur sa page, et referme immédiatement.
      pages.push({
        feuillet,
        numeroPage: 0,
        totalPages: 0,
        blocs: [bloc],
        hauteurTotalePx: bloc.hauteurPx,
      });
      continue;
    }

    // Flow standard : empilage jusqu'à MAX_CONTENT_HEIGHT_PX.
    if (pageActuelle.length > 0 && hauteurActuelle + bloc.hauteurPx > MAX_CONTENT_HEIGHT_PX) {
      fermerPage();
    }
    pageActuelle.push(bloc);
    hauteurActuelle += bloc.hauteurPx;
  }

  fermerPage();

  // Numérotation locale au feuillet.
  const total = pages.length;
  pages.forEach((page, i) => {
    page.numeroPage = i + 1;
    page.totalPages = total;
  });

  return pages;
}
