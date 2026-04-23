/**
 * docs/WORKFLOWS.md + CONSIGNE-EDITOR.md — amorce documentaire, prévisualisation sommaire, validation texte HTML.
 */

import { lettreAffichee } from "@/lib/tache/document-helpers";

/** docs/WORKFLOWS.md §4 — amorce documentaire (italique sous le bandeau). */
export function buildAmorceDocumentaire(nbDocs: number): string {
  if (nbDocs <= 0) return "";
  const lettres = Array.from({ length: nbDocs }, (_, i) => lettreAffichee(i));
  if (nbDocs === 1) return `Consultez le document ${lettres[0]}.`;
  const derniere = lettres.pop()!;
  return `Consultez les documents ${lettres.join(", ")} et ${derniere}.`;
}

/**
 * Span HTML `data-doc-ref` pour une lettre de slot — parsé par TipTap comme nœud `docRef`.
 * Source unique : tout HTML qui référence un document doit passer par ce helper.
 * Sérialise le placeholder au format numérique `{{doc_N}}` ; le `data-doc-ref`
 * conserve la lettre pour l'affichage dans l'éditeur.
 */
export function docRefSpan(letter: string): string {
  const numero = (letter.toUpperCase().charCodeAt(0) - 64) | 0;
  const safe = numero >= 1 ? numero : 1;
  return `<span data-doc-ref="${letter}">{{doc_${safe}}}</span>`;
}

/**
 * Amorce documentaire en HTML structuré avec `docRefSpan` — pour le HTML consigne
 * (gabarits templates, bascule gabarit → libre). Sans ponctuation finale.
 */
export function buildAmorceDocumentaireHtml(nbDocs: number): string {
  if (nbDocs <= 0) return "";
  const spans = Array.from({ length: nbDocs }, (_, i) => docRefSpan(lettreAffichee(i)));
  if (nbDocs === 1) return `Consultez le document ${spans[0]}`;
  const dernier = spans.pop()!;
  return `Consultez les documents ${spans.join(", ")} et ${dernier}`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Retire l’amorce documentaire en tête du texte — pour cartes et listes seulement ;
 * la fiche lecture garde la consigne complète.
 */
export function stripAmorceDocumentaireForMiniature(plainText: string): string {
  const s = plainText.trim();
  for (const n of [3, 2, 1] as const) {
    const phrase = buildAmorceDocumentaire(n);
    const re = new RegExp(`^${escapeRegExp(phrase)}\\s*`);
    if (re.test(s)) return s.replace(re, "").trim();
  }
  return s;
}

/**
 * Texte brut pour aperçu carte / liste : refs doc → lettres / numéros, sans HTML, sans amorce documentaire.
 * `nbDocuments` optionnel : résolution des `{{doc_*}}` (défaut 4 si absent).
 */
export function plainConsigneForMiniature(
  html: string | null | undefined,
  nbDocuments?: number,
): string {
  const s = html ?? "";
  return stripAmorceDocumentaireForMiniature(
    stripHtml(resolveConsigneHtmlForDisplay(s, nbDocuments)),
  );
}

/** Texte brut sans balises — cartes, extraits (TacheCard). */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remplace les spans `data-doc-ref` par la lettre seule (aperçu fiche / sommaire).
 * Une seule implémentation (regex) : le chemin DOM divergeait du SSR et cassait l’hydratation React (page blanche après navigation).
 */
export function resolveDocRefsForPreview(html: string): string {
  if (!html) return "";
  return html.replace(
    /<span[^>]*\bdata-doc-ref=["']([A-D])["'][^>]*>[\s\S]*?<\/span>/gi,
    (_, letter: string) => letter,
  );
}

const DOC_PLACEHOLDER_LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Remplace `{{doc_A}}` … `{{doc_D}}` par les numéros 1…N (aperçu tâche seule, sommaire, fiche).
 * `nbDocuments` défaut 4 : permet les extraits liste sans requête `nb_documents`.
 */
export function resolveDocPlaceholdersForSingleTask(html: string, nbDocuments = 4): string {
  if (!html) return "";
  const n = Math.min(Math.max(nbDocuments, 0), 4);
  let s = html;
  for (let i = 0; i < n; i++) {
    const L = DOC_PLACEHOLDER_LETTERS[i];
    s = s.replace(new RegExp(`\\{\\{doc_${L}\\}\\}`, "gi"), String(i + 1));
  }
  return s;
}

/** Chaîne d’affichage fiche / sommaire : placeholders puis pastilles `data-doc-ref`. */
export function resolveConsigneHtmlForDisplay(html: string, nbDocuments?: number): string {
  const n = nbDocuments === undefined ? 4 : nbDocuments;
  return resolveDocRefsForPreview(resolveDocPlaceholdersForSingleTask(html, n));
}

/** Texte significatif hors balises (consigne / corrigé / guidage HTML). Même logique SSR/client. */
export function htmlHasMeaningfulText(html: string): boolean {
  if (!html || !html.trim()) return false;
  return html.replace(/<[^>]+>/g, "").trim().length > 0;
}

/**
 * Section guidage sur **feuille élève** (impression) : respecte le drapeau sommatif / formatif futur.
 * `showGuidageOnStudentSheet === false` → jamais afficher, même si le HTML contient du texte.
 */
export function shouldShowGuidageOnStudentSheet(
  guidageHtml: string,
  showGuidageOnStudentSheet?: boolean,
): boolean {
  if (showGuidageOnStudentSheet === false) return false;
  return htmlHasMeaningfulText(guidageHtml);
}

/** Lettres doc manquantes (références attendues selon nb_documents). BLOC3 §5.5 */
export function getMissingDocLetters(html: string, nbDocuments: number): ("A" | "B" | "C" | "D")[] {
  if (nbDocuments <= 0) return [];
  const expected = (["A", "B", "C", "D"] as const).slice(0, Math.min(nbDocuments, 4));
  const present = new Set<string>();
  const reAttr = /data-doc-ref="([A-D])"/g;
  let m: RegExpExecArray | null;
  while ((m = reAttr.exec(html)) !== null) present.add(m[1]);
  const rePh = /\{\{doc_([A-D])\}\}/g;
  while ((m = rePh.exec(html)) !== null) present.add(m[1]);
  return expected.filter((x) => !present.has(x));
}
