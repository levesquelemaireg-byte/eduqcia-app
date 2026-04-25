/**
 * Point d'entrée impression document seul — couche 2.
 *
 * Transforme un document en `RenduImprimable` d'une seule page.
 * Le rendu utilise la grille du dossier documentaire avec une cellule
 * unique en span 2 (pleine largeur) — pas de demi-colonne artificielle
 * pour un document isolé.
 *
 * Pas de pagination : si le document déborde, erreur bloquante.
 */

import type { RendererDocument } from "@/lib/types/document-renderer";
import type { Mesureur } from "@/lib/epreuve/pagination/pager";
import { mesurerBloc } from "@/lib/epreuve/pagination/pager";
import { MAX_CONTENT_HEIGHT_PX } from "@/lib/epreuve/pagination/constantes";
import { construireBlocDossierPageUnique } from "@/lib/impression/builders/blocs-dossier-pages";
import type { RenduImprimable } from "@/lib/impression/types";

/** Empreinte déterministe pour la détection d'invalidation. */
function calculerEmpreinte(document: RendererDocument): string {
  const payload = JSON.stringify({ id: document.id, elements: document.elements.map((e) => e.id) });
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Transforme un document seul en rendu imprimable (1 page max).
 *
 * Fonction pure. Le document est toujours affiché avec son titre visible.
 * Erreur bloquante si le contenu dépasse la page.
 */
export function documentVersImprimable(
  document: RendererDocument,
  mesureur: Mesureur,
): RenduImprimable {
  const bloc = construireBlocDossierPageUnique(
    document,
    { titresVisibles: true },
    `document-${document.id}`,
  );
  const blocMesure = mesurerBloc(bloc, mesureur);

  if (blocMesure.hauteurPx > MAX_CONTENT_HEIGHT_PX) {
    return {
      ok: false,
      erreur: {
        kind: "DEBORDEMENT_BLOC",
        blocId: document.id,
        blocLibelle: document.titre,
        hauteurPx: blocMesure.hauteurPx,
        hauteurMaxPx: MAX_CONTENT_HEIGHT_PX,
        suggestion: "Le contenu dépasse la page — réduisez la taille du document.",
      },
    };
  }

  return {
    ok: true,
    empreinte: calculerEmpreinte(document),
    contexte: { type: "document" },
    enTete: null,
    pages: [
      {
        feuillet: "dossier-documentaire",
        numeroPage: 1,
        totalPages: 1,
        blocs: [blocMesure],
        hauteurTotalePx: blocMesure.hauteurPx,
      },
    ],
  };
}
