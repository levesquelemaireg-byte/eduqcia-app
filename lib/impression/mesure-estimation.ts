import type { Bloc } from "@/lib/epreuve/pagination/types";
import { htmlHasMeaningfulText, stripHtml } from "@/lib/tache/consigne-helpers";
import type { RendererDocument, DocumentElement } from "@/lib/types/document-renderer";

const MAX_IMAGE_HEIGHT_PX = 416;
const MAX_IMAGE_WIDTH_PX = 620;
const MIN_IMAGE_HEIGHT_PX = 140;
const DEFAULT_IMAGE_HEIGHT_PX = 270;

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

function estimerHauteurImage(
  element: Extract<DocumentElement, { type: "iconographique" }>,
): number {
  const w = element.imagePixelWidth;
  const h = element.imagePixelHeight;
  if (!Number.isFinite(w) || !Number.isFinite(h) || !w || !h || w <= 0 || h <= 0) {
    return DEFAULT_IMAGE_HEIGHT_PX;
  }

  const projectedByWidth = (h / w) * MAX_IMAGE_WIDTH_PX;
  const projected = Math.min(h, projectedByWidth, MAX_IMAGE_HEIGHT_PX);
  return clamp(Math.round(projected), MIN_IMAGE_HEIGHT_PX, MAX_IMAGE_HEIGHT_PX);
}

function estimerHauteurSource(source: string): number {
  const len = longueurHtml(source);
  const lignes = lignesDepuisLongueur(len, 95);
  return 12 + lignes * 15;
}

function estimerHauteurElementDocument(element: DocumentElement): number {
  const metaCount = [element.auteur, element.repereTemporel, element.sousTitre].filter(
    Boolean,
  ).length;
  const metaHeight = metaCount * 16;

  if (element.type === "textuel") {
    const lignes = lignesDepuisLongueur(longueurHtml(element.contenu), 95);
    const body = lignes * 18;
    return Math.max(96, 20 + metaHeight + body);
  }

  const image = estimerHauteurImage(element);
  const legendeLen = (element.legende ?? "").trim().length;
  const legendeLines = lignesDepuisLongueur(legendeLen, 88, 0);
  const legendeHeight = legendeLines * 16;
  return 18 + metaHeight + image + legendeHeight;
}

function extraireDocument(content: unknown): RendererDocument | null {
  if (!estObjet(content)) return null;

  const maybeNested = content.document;
  if (estObjet(maybeNested) && Array.isArray(maybeNested.elements)) {
    return maybeNested as unknown as RendererDocument;
  }

  if (Array.isArray(content.elements)) {
    return content as unknown as RendererDocument;
  }

  return null;
}

function estimerHauteurBlocDocument(content: unknown): number {
  const document = extraireDocument(content);
  if (!document || document.elements.length === 0) {
    return 280;
  }

  const overhead = document.structure === "simple" ? 92 : 100;

  if (document.structure === "simple") {
    const first = document.elements[0];
    const contenu = estimerHauteurElementDocument(first);
    const source = estimerHauteurSource(first.source);
    return Math.ceil((overhead + contenu + source) * 1.1 + 12);
  }

  const contenuMax = Math.max(...document.elements.map(estimerHauteurElementDocument));
  const sourceMax = Math.max(...document.elements.map((el) => estimerHauteurSource(el.source)));
  return Math.ceil((overhead + contenuMax + sourceMax) * 1.1 + 16);
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
    case "document":
      return estimerHauteurBlocDocument(bloc.content);
    case "quadruplet":
      return estimerHauteurBlocQuadruplet(bloc.content);
    case "entete-section":
      return 40;
    default:
      return 260;
  }
}
