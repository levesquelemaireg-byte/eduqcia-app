/**
 * Document textuel autonome : extrait saisi en texte brut → fragment HTML sûr pour affichage
 * cohérent avec les fiches qui utilisent `dangerouslySetInnerHTML`.
 */
export function escapePlainTextAsHtmlParagraph(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const escaped = t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<p>${escaped.replace(/\r\n|\r|\n/g, "<br/>")}</p>`;
}
