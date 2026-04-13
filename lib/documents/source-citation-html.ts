/**
 * Citation de source documentaire — saisie riche (TipTap HTML) ou texte hérité.
 * Affichage : fragments HTML conservés ; texte sans balises échappé en un paragraphe.
 */

import DOMPurify from "isomorphic-dompurify";

// Réexport pour compatibilité — les consumers légers devraient importer depuis strip-html.ts
export { stripHtmlToPlainText } from "@/lib/documents/strip-html";

/** Détecte un fragment issu de TipTap (balises sûres) — pas une simple chaîne avec un `<` isolé. */
const LOOKS_LIKE_RICH_HTML = /<\s*\/?\s*(p|ul|ol|li|strong|em|u|br|span)\b/i;

export function escapeHtmlPlain(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * HTML sanitisé pour `dangerouslySetInnerHTML` : contenu TipTap ou citation plain text historique.
 * DOMPurify appliqué systématiquement — tous les appelants sont protégés.
 */
export function sourceCitationDisplayHtml(stored: string): string {
  const t = stored.trim();
  if (!t) return "";
  if (LOOKS_LIKE_RICH_HTML.test(t)) return DOMPurify.sanitize(t);
  return `<p>${escapeHtmlPlain(t)}</p>`;
}
