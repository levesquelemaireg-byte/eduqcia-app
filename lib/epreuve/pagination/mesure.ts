/**
 * Mesure offscreen isomorphe côté client — print-engine v2.1 §D2.
 *
 * Crée un conteneur invisible, rend le bloc dedans, lit offsetHeight, nettoie.
 * Ce fichier est client-only : il utilise le DOM (document, HTMLElement).
 */

import "client-only";

import { PAGE_WIDTH_PX } from "./constantes";
import type { Bloc } from "./types";
import type { Mesureur } from "./pager";

/**
 * Crée un mesureur offscreen qui utilise un conteneur DOM invisible
 * pour mesurer la hauteur réelle d'un bloc rendu.
 *
 * Le `rendreBlocDansElement` est une fonction fournie par l'appelant qui
 * rend le contenu du bloc dans l'élément DOM passé en paramètre.
 * Cela permet de découpler la mesure du rendu React.
 *
 * @param rendreBlocDansElement - Fonction qui rend le contenu d'un bloc dans un élément DOM.
 * @returns Un objet avec `mesurer` (le Mesureur) et `detruire` (nettoyage du conteneur).
 */
export function creerMesureurOffscreen(
  rendreBlocDansElement: (bloc: Bloc, conteneur: HTMLElement) => void,
): { mesurer: Mesureur; detruire: () => void } {
  const conteneur = document.createElement("div");
  conteneur.style.position = "fixed";
  conteneur.style.left = "-9999px";
  conteneur.style.top = "0";
  conteneur.style.width = `${PAGE_WIDTH_PX}px`;
  conteneur.style.visibility = "hidden";
  document.body.appendChild(conteneur);

  const mesurer: Mesureur = (bloc: Bloc): number => {
    conteneur.innerHTML = "";
    rendreBlocDansElement(bloc, conteneur);
    const hauteur = conteneur.offsetHeight;
    conteneur.innerHTML = "";
    return hauteur;
  };

  const detruire = () => {
    conteneur.innerHTML = "";
    conteneur.remove();
  };

  return { mesurer, detruire };
}
