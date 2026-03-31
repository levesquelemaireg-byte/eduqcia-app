/** Heuristique URL publique Supabase Storage (fichier `.pdf`). */
export function isDocumentPdfUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  return u.endsWith(".pdf") || /\.pdf(\?|#|$)/.test(u);
}
