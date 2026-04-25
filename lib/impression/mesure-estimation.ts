import type { Bloc } from "@/lib/epreuve/pagination/types";
import { htmlHasMeaningfulText, stripHtml } from "@/lib/tache/consigne-helpers";
import {
  estimerHauteur as estimerHauteurCelluleDossier,
  type PageDossier,
} from "@/lib/impression/layout-dossier-documentaire";
import { DOSSIER_GAP_VERTICAL_PX } from "@/lib/impression/constantes-dossier-documentaire";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function estObjet(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function lignesDepuisLongueur(longueur: number, charsParLigne: number, minLignes = 1): number {
  if (longueur <= 0) return minLignes;
  return Math.max(minLignes, Math.ceil(longueur / charsParLigne));
}

function longueurHtml(html: string): number {
  return stripHtml(html).length;
}

/**
 * Hauteur réelle d'un bloc dossier-page : somme des hauteurs des rangées
 * (max des cellules par rangée) + gaps verticaux. Cohérent avec ce que
 * `placerDocuments` a calculé en amont.
 */
function estimerHauteurBlocDossierPage(content: unknown): number {
  if (!estObjet(content)) return 0;
  const page = content.page as PageDossier | undefined;
  if (!page || page.rangees.length === 0) return 0;

  let total = 0;
  for (const rangee of page.rangees) {
    if (rangee.cellules.length === 0) continue;
    const hRangee = Math.max(
      ...rangee.cellules.map((c) => estimerHauteurCelluleDossier(c.document, c.span)),
    );
    total += hRangee;
  }
  total += Math.max(0, page.rangees.length - 1) * DOSSIER_GAP_VERTICAL_PX;
  return total;
}

function estimerHauteurEspaceProduction(content: unknown): number {
  if (!estObjet(content) || typeof content.type !== "string") return 40;

  switch (content.type) {
    case "lignes": {
      const nbLignes = Number(content.nbLignes);
      const n = Number.isFinite(nbLignes) ? clamp(Math.floor(nbLignes), 1, 40) : 8;
      return 12 + n * 24;
    }
    case "cases":
      return 54;
    case "libre":
      return 108;
    default:
      return 40;
  }
}

function estimerHauteurOutilEvaluation(content: unknown): number {
  if (!estObjet(content) || !Array.isArray(content.criteres) || content.criteres.length === 0) {
    return 0;
  }

  const criteres = content.criteres;

  let nbNiveaux = 3;
  const premier = criteres[0];
  if (estObjet(premier) && Array.isArray(premier.descripteurs) && premier.descripteurs.length > 0) {
    nbNiveaux = premier.descripteurs.length;
  }

  const charsParCellule = clamp(36 - nbNiveaux * 4, 18, 30);

  let totalRows = 0;
  for (const critere of criteres) {
    if (!estObjet(critere)) {
      totalRows += 32;
      continue;
    }

    const tailles: number[] = [];
    if (typeof critere.libelle === "string") {
      tailles.push(critere.libelle.trim().length);
    }

    if (Array.isArray(critere.descripteurs)) {
      for (const desc of critere.descripteurs) {
        if (estObjet(desc) && typeof desc.description === "string") {
          tailles.push(longueurHtml(desc.description));
        }
      }
    }

    const maxTexte = Math.max(8, ...tailles);
    const lignes = lignesDepuisLongueur(maxTexte, charsParCellule);
    totalRows += Math.max(30, lignes * 16 + 10);
  }

  return 14 + 34 + totalRows;
}

function estimerHauteurBlocQuadruplet(content: unknown): number {
  if (!estObjet(content)) return 260;

  const titre = typeof content.titre === "string" ? content.titre.trim() : "";
  const consigne = typeof content.consigne === "string" ? content.consigne : "";
  const corrige = typeof content.corrige === "string" ? content.corrige : "";

  let total = 56;
  total += lignesDepuisLongueur(titre.length, 60, 1) * 20;

  const hasConsigne = htmlHasMeaningfulText(consigne);
  const hasCorrige = htmlHasMeaningfulText(corrige);

  if (hasConsigne) {
    const lignesConsigne = lignesDepuisLongueur(longueurHtml(consigne), 92);
    total += 12 + lignesConsigne * 19;
  }

  if (hasCorrige) {
    const lignesCorrige = lignesDepuisLongueur(longueurHtml(corrige), 92);
    total += 12 + lignesCorrige * 19;
  }

  const guidage = content.guidage;
  if (
    estObjet(guidage) &&
    typeof guidage.content === "string" &&
    htmlHasMeaningfulText(guidage.content)
  ) {
    const lignesGuidage = lignesDepuisLongueur(longueurHtml(guidage.content), 88);
    total += 14 + lignesGuidage * 17;
  }

  total += estimerHauteurEspaceProduction(content.espaceProduction);
  total += estimerHauteurOutilEvaluation(content.outilEvaluation);

  // Bloc cahier-reponses : parfois sans consigne/corrigé, on garde une hauteur minimale réaliste.
  if (!hasConsigne && !hasCorrige && total < 120) {
    total = 120;
  }

  return Math.ceil(total * 1.1 + 10);
}

/**
 * Mesureur heuristique partagé quand la mesure DOM réelle n'est pas disponible.
 *
 * Objectif : sur-estimer légèrement pour éviter la troncature visuelle des pages.
 */
export function mesurerBlocImpression(bloc: Bloc): number {
  switch (bloc.kind) {
    case "dossier-page":
      return estimerHauteurBlocDossierPage(bloc.content);
    case "quadruplet":
      return estimerHauteurBlocQuadruplet(bloc.content);
    case "entete-section":
      return 40;
    default:
      return 260;
  }
}
