/**
 * docs/WORKFLOWS.md + CONSIGNE-EDITOR.md — amorce documentaire, prévisualisation sommaire, validation texte HTML.
 *
 * Convention d'affichage : chiffres 1..N partout (wizard, fiche, impression, aperçu).
 * Les anciens formats alphabétiques (`{{doc_A}}`, `data-doc-ref="A"`) sont acceptés
 * en lecture pour la rétrocompatibilité des brouillons et TAÉ publiées avant la
 * migration Phase 1 — toute nouvelle écriture utilise des chiffres.
 */

/** docs/WORKFLOWS.md §4 — amorce documentaire (italique sous le bandeau). */
export function buildAmorceDocumentaire(nbDocs: number): string {
  if (nbDocs <= 0) return "";
  const numeros = Array.from({ length: nbDocs }, (_, i) => String(i + 1));
  if (nbDocs === 1) return `Consultez le document ${numeros[0]}.`;
  const dernier = numeros.pop()!;
  return `Consultez les documents ${numeros.join(", ")} et ${dernier}.`;
}

/**
 * Span HTML `data-doc-ref` pour un numéro de slot — parsé par TipTap comme nœud `docRef`.
 * Source unique : tout HTML qui référence un document doit passer par ce helper.
 * Sérialise le placeholder au format numérique `{{doc_N}}` ; le `data-doc-ref`
 * contient le même chiffre pour l'affichage dans l'éditeur.
 */
export function docRefSpan(numero: number): string {
  const safe = Number.isFinite(numero) && numero >= 1 ? Math.trunc(numero) : 1;
  return `<span data-doc-ref="${safe}">{{doc_${safe}}}</span>`;
}

/**
 * Amorce documentaire en HTML structuré avec `docRefSpan` — pour le HTML consigne
 * (gabarits templates, bascule gabarit → libre). Sans ponctuation finale.
 */
export function buildAmorceDocumentaireHtml(nbDocs: number): string {
  if (nbDocs <= 0) return "";
  const spans = Array.from({ length: nbDocs }, (_, i) => docRefSpan(i + 1));
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
  for (const n of [4, 3, 2, 1] as const) {
    const phrase = buildAmorceDocumentaire(n);
    const re = new RegExp(`^${escapeRegExp(phrase)}\\s*`);
    if (re.test(s)) return s.replace(re, "").trim();
  }
  return s;
}

/**
 * Texte brut pour aperçu carte / liste : refs doc → numéros, sans HTML, sans amorce documentaire.
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
 * Remplace les spans `data-doc-ref` par le numéro seul (aperçu fiche / sommaire).
 * Accepte les chiffres (format courant) et les lettres (legacy, converties en chiffres).
 */
export function resolveDocRefsForPreview(html: string): string {
  if (!html) return "";
  return html.replace(
    /<span[^>]*\bdata-doc-ref=["']([0-9A-Za-z]+)["'][^>]*>[\s\S]*?<\/span>/gi,
    (_, ref: string) => {
      if (/^\d+$/.test(ref)) return ref;
      // Legacy : lettre → numéro (A=1, B=2, …).
      const idx = ref.toUpperCase().charCodeAt(0) - 64;
      return idx >= 1 ? String(idx) : ref;
    },
  );
}

/**
 * Remplace les placeholders `{{doc_N}}` (numérique) et `{{doc_A}}` (legacy) par
 * les numéros 1…N (aperçu tâche seule, sommaire, fiche).
 * `nbDocuments` défaut 4 : permet les extraits liste sans requête `nb_documents`.
 */
export function resolveDocPlaceholdersForSingleTask(html: string, nbDocuments = 4): string {
  if (!html) return "";
  const n = Math.max(nbDocuments, 0);
  // Format numérique (courant) : {{doc_1}}, {{doc_2}}, … (insensible à la casse sur « doc »).
  let s = html.replace(/\{\{doc_(\d+)\}\}/gi, (match, num: string) => {
    const idx = parseInt(num, 10) - 1;
    return idx >= 0 && idx < n ? String(idx + 1) : match;
  });
  // Format alphabétique (legacy) : {{doc_A}} → 1, {{doc_B}} → 2, …
  s = s.replace(/\{\{doc_([A-Za-z])\}\}/gi, (match, letter: string) => {
    const idx = letter.toUpperCase().charCodeAt(0) - 65;
    return idx >= 0 && idx < n ? String(idx + 1) : match;
  });
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

/** Numéros de documents manquants (références attendues selon nb_documents). BLOC3 §5.5 */
export function getMissingDocNumeros(html: string, nbDocuments: number): number[] {
  if (nbDocuments <= 0) return [];
  const expected = Array.from({ length: nbDocuments }, (_, i) => i + 1);
  const present = new Set<number>();
  // Spans data-doc-ref (chiffre — format courant).
  const reAttrNum = /data-doc-ref=["']?(\d+)["']?/g;
  let m: RegExpExecArray | null;
  while ((m = reAttrNum.exec(html)) !== null) {
    const n = parseInt(m[1]!, 10);
    if (Number.isFinite(n) && n >= 1) present.add(n);
  }
  // Spans data-doc-ref (lettre — legacy).
  const reAttrLetter = /data-doc-ref=["']?([A-Za-z])["']?/g;
  while ((m = reAttrLetter.exec(html)) !== null) {
    const n = m[1]!.toUpperCase().charCodeAt(0) - 64;
    if (n >= 1) present.add(n);
  }
  // Placeholders numériques : {{doc_1}} → 1, {{doc_2}} → 2, …
  const rePhNum = /\{\{doc_(\d+)\}\}/g;
  while ((m = rePhNum.exec(html)) !== null) {
    const n = parseInt(m[1]!, 10);
    if (Number.isFinite(n) && n >= 1) present.add(n);
  }
  // Placeholders alphabétiques (legacy) : {{doc_A}}
  const rePhLetter = /\{\{doc_([A-Za-z])\}\}/g;
  while ((m = rePhLetter.exec(html)) !== null) {
    const n = m[1]!.toUpperCase().charCodeAt(0) - 64;
    if (n >= 1) present.add(n);
  }
  return expected.filter((x) => !present.has(x));
}
