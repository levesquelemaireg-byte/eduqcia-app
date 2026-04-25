/**
 * Builder de blocs dossier-page — couche 1.
 *
 * Transforme une liste de documents (numérotés) en un ensemble de
 * `Bloc{kind:"dossier-page"}`, chacun représentant une page de la grille
 * bicolonnée 2×3. Un bloc = une page de dossier.
 *
 * Le placement (span 1 vs 2, saut de page) est délégué au moteur de layout
 * `lib/impression/layout-dossier-documentaire.ts`. Ce builder orchestre :
 * dérivation des métriques → placement → construction des blocs.
 *
 * Hauteur utile : 904 px (= 1056 − 2×76, sans en-tête de page). Cohérent
 * pour les trois contextes (document seul, tâche seule, épreuve) — l'en-tête
 * d'épreuve et la pagination de bas de page vivent dans les marges 2 cm,
 * pas dans la zone de contenu.
 */

import type { Bloc } from "@/lib/epreuve/pagination/types";
import type { RendererDocument } from "@/lib/types/document-renderer";
import {
  deriverMetriquesDocument,
  placerDocuments,
  type DocumentAPositionner,
  type PageDossier,
} from "@/lib/impression/layout-dossier-documentaire";
import { HAUTEUR_UTILE_HORS_EPREUVE_PX } from "@/lib/impression/constantes-dossier-documentaire";

/** Contenu structuré d'un bloc dossier-page (consommé par DossierGrille). */
export type ContenuDossierPage = {
  page: PageDossier;
  /** Map id → document source (résolution des cellules au rendu). */
  sources: Map<string, RendererDocument>;
  /** Faux en mode sommatif/épreuve : badge + titre masqués. */
  titresVisibles: boolean;
};

export type DocumentNumerote = {
  numeroGlobal: number;
  document: RendererDocument;
};

/**
 * Construit N blocs dossier-page à partir d'une liste de documents numérotés.
 *
 * Cas dégénéré : liste vide → tableau vide.
 */
export function construireBlocsDossierPages(
  docs: DocumentNumerote[],
  options: { titresVisibles: boolean },
  idPrefix: string,
): Bloc[] {
  if (docs.length === 0) return [];

  const metriques: DocumentAPositionner[] = docs.map(({ document, numeroGlobal }) =>
    deriverMetriquesDocument(document, numeroGlobal, { titreVisible: options.titresVisibles }),
  );

  const layout = placerDocuments(metriques, {
    hauteurUtilePx: HAUTEUR_UTILE_HORS_EPREUVE_PX,
  });

  const sources = new Map<string, RendererDocument>();
  for (const { document } of docs) {
    sources.set(document.id, document);
  }

  return layout.pages.map((page, pageIdx) => ({
    id: `${idPrefix}-${pageIdx}`,
    kind: "dossier-page" as const,
    pagination: { mode: "exclusive-page" as const },
    content: {
      page,
      sources,
      titresVisibles: options.titresVisibles,
    } satisfies ContenuDossierPage,
  }));
}

/**
 * Construit un bloc dossier-page unique pour le rendu d'un document isolé
 * (banque, vue détaillée document seul). Force span 2 — pleine largeur, pas
 * de demi-colonne artificielle.
 */
export function construireBlocDossierPageUnique(
  document: RendererDocument,
  options: { titresVisibles: boolean },
  id: string,
): Bloc {
  const metrique = deriverMetriquesDocument(document, 1, {
    titreVisible: options.titresVisibles,
  });
  const page: PageDossier = {
    rangees: [{ cellules: [{ document: metrique, span: 2 }] }],
  };
  const sources = new Map<string, RendererDocument>([[document.id, document]]);
  return {
    id,
    kind: "dossier-page",
    pagination: { mode: "exclusive-page" },
    content: {
      page,
      sources,
      titresVisibles: options.titresVisibles,
    } satisfies ContenuDossierPage,
  };
}
