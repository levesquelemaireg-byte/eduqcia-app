/**
 * Produit l'overlay « corrigé simple » d'une consigne NR — injecte la bonne
 * réponse en rouge dans les fragments d'origine.
 *
 * Le « calque » de spec §3.5 est conceptuel : aucune position absolue, aucun
 * z-index, aucun calque CSS. C'est une réécriture du HTML des fragments où
 * l'on insère le marquage rouge directement dans la zone réponse (ou dans
 * le corps quand la réponse est intégrée — manifestations, causes-conséquences,
 * carte-historique 2.3).
 *
 * Le renderer (`SectionQuadruplet`) consomme ces fragments comme n'importe
 * quels fragments NR — il ne sait pas qu'il rend un corrigé.
 *
 * Spec : docs/specs/SPEC-PIPELINE-RENDU-IMPRIME.md §3.5, §7.5.
 */

import type { FragmentsNR } from "@/lib/impression/extraire-fragments-nr";
import { PRINT_CORRIGE_COLOR } from "@/styles/impression/tokens";

/* -------------------------------------------------------------------------- */
/*  Styles inline injectés                                                    */
/* -------------------------------------------------------------------------- */

/** Style appliqué aux cases (réponse box) qui reçoivent la lettre / le chiffre. */
const STYLE_BOX_LETTRE = `display: inline-flex; align-items: center; justify-content: center; color: ${PRINT_CORRIGE_COLOR}; font-weight: 500;`;

/** Style appliqué à un digit cell d'ordre chronologique (bordure 2px). */
const STYLE_DIGIT_ROUGE = `border: 2px solid ${PRINT_CORRIGE_COLOR}; color: ${PRINT_CORRIGE_COLOR};`;

/** Style appliqué à l'option (div) d'ordre chronologique correcte (texte rouge). */
const STYLE_OPTION_ROUGE = `color: ${PRINT_CORRIGE_COLOR};`;

/** Style appliqué à chaque cellule (td) de la rangée correcte d'avant-après. */
const STYLE_TD_ROUGE = `border: 2px solid ${PRINT_CORRIGE_COLOR}; color: ${PRINT_CORRIGE_COLOR};`;

/** Style appliqué à la cellule lettre (th sans bordure) — couleur seule. */
const STYLE_TH_LETTRE_ROUGE = `color: ${PRINT_CORRIGE_COLOR};`;

/* -------------------------------------------------------------------------- */
/*  Helpers de parsing du corrigé HTML                                         */
/* -------------------------------------------------------------------------- */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Strip toutes les balises HTML — utile pour parser le texte du corrigé. */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrait la lettre A/B/C/D depuis un corrigé du format
 * « Réponse attendue : LETTRE. ». Retourne null si introuvable.
 */
function extraireLettreUnique(corrigeHtml: string): "A" | "B" | "C" | "D" | null {
  const text = stripTags(corrigeHtml);
  const m = text.match(/R[ée]ponse\s+attendue\s*:\s*([ABCD])\b/i);
  return m ? (m[1] as "A" | "B" | "C" | "D") : null;
}

/**
 * Extrait les deux lettres du corrigé carte historique 2.3 (template
 * « LETTRE pour ÉLÉMENT ; LETTRE pour ÉLÉMENT. »). Retourne null si la
 * structure ne correspond pas.
 */
function extraireDeuxLettresCarte23(corrigeHtml: string): [string, string] | null {
  const text = stripTags(corrigeHtml);
  const m = text.match(/([ABCD])\s+pour[\s\S]*?;\s*([ABCD])\s+pour/);
  if (!m) return null;
  return [m[1]!, m[2]!];
}

/**
 * Extrait, dans l'ordre des items du `<ul>` du corrigé, les nombres associés
 * à chaque catégorie (1-indexés). Retourne un tableau par catégorie :
 *
 * ```
 * <ul>
 *   <li><strong>Économie</strong> : 1 et 2</li>
 *   <li><strong>Politique</strong> : 3 et 4</li>
 * </ul>
 * → [[1, 2], [3, 4]]
 * ```
 */
function extraireNombresParCategorie(corrigeHtml: string): number[][] {
  const items: number[][] = [];
  const re = /<li>[\s\S]*?<\/strong>([\s\S]*?)<\/li>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(corrigeHtml))) {
    const nums = (m[1]!.match(/\d+/g) ?? []).map((n) => parseInt(n, 10));
    items.push(nums);
  }
  return items;
}

/* -------------------------------------------------------------------------- */
/*  Helpers d'injection HTML                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Remplace la première case `<span class="boxClass" …></span>` vide par une
 * case contenant `contenu` avec le style rouge.
 */
function injecterDansCase(html: string, boxClass: string, contenu: string): string {
  const cls = escapeRegex(boxClass);
  const re = new RegExp(`<span\\s+class="${cls}"([^>]*?)></span>`);
  return html.replace(
    re,
    (_, attrs: string) =>
      `<span class="${boxClass}"${attrs} style="${STYLE_BOX_LETTRE}">${escapeHtml(contenu)}</span>`,
  );
}

/**
 * Remplace, dans l'ordre, chaque case `<span class="boxClass" …></span>`
 * vide rencontrée par le contenu correspondant dans `contenus`. Les cases
 * sans contenu correspondant restent vides.
 */
function injecterDansToutesLesCases(html: string, boxClass: string, contenus: string[]): string {
  const cls = escapeRegex(boxClass);
  const re = new RegExp(`<span\\s+class="${cls}"([^>]*?)></span>`, "g");
  let i = 0;
  return html.replace(re, (full, attrs: string) => {
    const contenu = contenus[i++];
    if (contenu === undefined || contenu === "") return full;
    return `<span class="${boxClass}"${attrs} style="${STYLE_BOX_LETTRE}">${escapeHtml(contenu)}</span>`;
  });
}

/* -------------------------------------------------------------------------- */
/*  Ordre chronologique — case réponse + option correcte                       */
/* -------------------------------------------------------------------------- */

function produireOrdreChrono(fragments: FragmentsNR, corrigeHtml: string): FragmentsNR {
  const lettre = extraireLettreUnique(corrigeHtml);
  if (!lettre) return fragments;

  const reponse =
    fragments.reponse !== null
      ? injecterDansCase(fragments.reponse, "ordre-chrono-eleve-reponse-box", lettre)
      : fragments.reponse;

  const corps = fragments.corps.replace(
    /<div class="ordre-chrono-eleve-option">([\s\S]*?)<\/div>/g,
    (match, inner: string) => {
      const letterRe = new RegExp(`>${escapeRegex(lettre)}\\)`);
      if (!letterRe.test(inner)) return match;
      const styledInner = inner.replace(
        /<span class="ordre-chrono-eleve-digit">/g,
        `<span class="ordre-chrono-eleve-digit" style="${STYLE_DIGIT_ROUGE}">`,
      );
      return `<div class="ordre-chrono-eleve-option" style="${STYLE_OPTION_ROUGE}">${styledInner}</div>`;
    },
  );

  return { ...fragments, corps, reponse };
}

/* -------------------------------------------------------------------------- */
/*  Ligne du temps — case réponse uniquement (frise SVG non modifiée)          */
/* -------------------------------------------------------------------------- */

function produireLigneTemps(fragments: FragmentsNR, corrigeHtml: string): FragmentsNR {
  const lettre = extraireLettreUnique(corrigeHtml);
  if (!lettre || fragments.reponse === null) return fragments;
  const reponse = injecterDansCase(fragments.reponse, "ligne-temps-eleve-reponse-box", lettre);
  return { ...fragments, reponse };
}

/* -------------------------------------------------------------------------- */
/*  Avant-après — case réponse + rangée correcte                               */
/* -------------------------------------------------------------------------- */

function produireAvantApres(fragments: FragmentsNR, corrigeHtml: string): FragmentsNR {
  const lettre = extraireLettreUnique(corrigeHtml);
  if (!lettre) return fragments;

  const reponse =
    fragments.reponse !== null
      ? injecterDansCase(fragments.reponse, "avant-apres-eleve-reponse-box", lettre)
      : fragments.reponse;

  const corps = fragments.corps.replace(
    /<tr class="avant-apres-eleve-option-row">([\s\S]*?)<\/tr>/g,
    (match, inner: string) => {
      const letterRe = new RegExp(
        `<th[^>]*class="avant-apres-eleve-letter-cell"[^>]*>${escapeRegex(lettre)}\\)`,
      );
      if (!letterRe.test(inner)) return match;
      const styled = inner
        .replace(
          /<th\s+scope="row"\s+class="avant-apres-eleve-letter-cell">/g,
          `<th scope="row" class="avant-apres-eleve-letter-cell" style="${STYLE_TH_LETTRE_ROUGE}">`,
        )
        .replace(
          /<td class="avant-apres-eleve-cell-avant">/g,
          `<td class="avant-apres-eleve-cell-avant" style="${STYLE_TD_ROUGE}">`,
        )
        .replace(
          /<td class="avant-apres-eleve-cell-repere">/g,
          `<td class="avant-apres-eleve-cell-repere" style="${STYLE_TD_ROUGE}">`,
        )
        .replace(
          /<td class="avant-apres-eleve-cell-apres">/g,
          `<td class="avant-apres-eleve-cell-apres" style="${STYLE_TD_ROUGE}">`,
        );
      return `<tr class="avant-apres-eleve-option-row">${styled}</tr>`;
    },
  );

  return { ...fragments, corps, reponse };
}

/* -------------------------------------------------------------------------- */
/*  Carte historique — 2.1 / 2.2 (reponse séparée) ou 2.3 (cases inline)       */
/* -------------------------------------------------------------------------- */

function produireCarteHistorique(fragments: FragmentsNR, corrigeHtml: string): FragmentsNR {
  // 2.3 : corps contient <ul class="carte-historique-eleve-items"> avec cases inline.
  if (fragments.corps.includes("carte-historique-eleve-items")) {
    const lettres = extraireDeuxLettresCarte23(corrigeHtml);
    if (!lettres) return fragments;
    const corps = injecterDansToutesLesCases(
      fragments.corps,
      "carte-historique-eleve-reponse-box",
      lettres,
    );
    return { ...fragments, corps };
  }

  // 2.1 / 2.2 : reponse séparée.
  const lettre = extraireLettreUnique(corrigeHtml);
  if (!lettre || fragments.reponse === null) return fragments;
  const reponse = injecterDansCase(fragments.reponse, "carte-historique-eleve-reponse-box", lettre);
  return { ...fragments, reponse };
}

/* -------------------------------------------------------------------------- */
/*  Manifestations — chaque cellule reçoit ses numéros de documents            */
/* -------------------------------------------------------------------------- */

function produireManifestations(fragments: FragmentsNR, corrigeHtml: string): FragmentsNR {
  const groupes = extraireNombresParCategorie(corrigeHtml);
  if (groupes.length === 0) return fragments;

  let idxCellule = 0;
  const corps = fragments.corps.replace(
    /<div class="manifestations-eleve-cellule">([\s\S]*?)<\/div>/g,
    (match, inner: string) => {
      const numeros = groupes[idxCellule++] ?? [];
      if (numeros.length === 0) return match;
      const styled = injecterDansToutesLesCases(
        inner,
        "manifestations-eleve-case",
        numeros.map(String),
      );
      return `<div class="manifestations-eleve-cellule">${styled}</div>`;
    },
  );

  return { ...fragments, corps };
}

/* -------------------------------------------------------------------------- */
/*  Causes-conséquences — chaque cellule reçoit son numéro                     */
/* -------------------------------------------------------------------------- */

function produireCausesConsequences(fragments: FragmentsNR, corrigeHtml: string): FragmentsNR {
  const groupes = extraireNombresParCategorie(corrigeHtml);
  if (groupes.length === 0) return fragments;

  let idxCellule = 0;
  const corps = fragments.corps.replace(
    /<div class="causes-consequences-eleve-cellule">([\s\S]*?)<\/div>/g,
    (match, inner: string) => {
      const numeros = groupes[idxCellule++] ?? [];
      if (numeros.length === 0) return match;
      const styled = injecterDansToutesLesCases(
        inner,
        "causes-consequences-eleve-case",
        numeros.map(String),
      );
      return `<div class="causes-consequences-eleve-cellule">${styled}</div>`;
    },
  );

  return { ...fragments, corps };
}

/* -------------------------------------------------------------------------- */
/*  Entrée publique                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Produit des fragments NR avec le marquage corrigé simple injecté.
 *
 * - `reponseAttendue` est le HTML du corrigé (`tache.corrige`) — parsé par
 *   parcours pour extraire lettres / numéros.
 * - Si le corrigé est vide ou impossible à parser, les fragments d'origine
 *   sont retournés inchangés (la version élève s'affiche normalement).
 */
export function produireCorrigeSimpleNR(
  fragments: FragmentsNR,
  reponseAttendue: string,
): FragmentsNR {
  if (!reponseAttendue) return fragments;
  switch (fragments.parcours) {
    case "ordre-chrono-eleve":
      return produireOrdreChrono(fragments, reponseAttendue);
    case "ligne-temps-eleve":
      return produireLigneTemps(fragments, reponseAttendue);
    case "avant-apres-eleve":
      return produireAvantApres(fragments, reponseAttendue);
    case "carte-historique-eleve":
      return produireCarteHistorique(fragments, reponseAttendue);
    case "manifestations-eleve":
      return produireManifestations(fragments, reponseAttendue);
    case "causes-consequences-eleve":
      return produireCausesConsequences(fragments, reponseAttendue);
    default:
      return fragments;
  }
}
