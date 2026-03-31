/**
 * Citation de source documentaire — saisie riche (TipTap HTML) ou texte hérité.
 * Affichage : fragments HTML conservés ; texte sans balises échappé en un paragraphe.
 */

/** Détecte un fragment issu de TipTap (balises sûres) — pas une simple chaîne avec un `<` isolé. */
const LOOKS_LIKE_RICH_HTML = /<\s*\/?\s*(p|ul|ol|li|strong|em|u|br|span)\b/i;

export function escapeHtmlPlain(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Texte plat pour recherche / listes (approximation sans parseur DOM). */
export function stripHtmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * HTML sûr pour `dangerouslySetInnerHTML` : contenu TipTap ou citation plain text historique.
 */
export function sourceCitationDisplayHtml(stored: string): string {
  const t = stored.trim();
  if (!t) return "";
  if (LOOKS_LIKE_RICH_HTML.test(t)) return t;
  return `<p>${escapeHtmlPlain(t)}</p>`;
}
