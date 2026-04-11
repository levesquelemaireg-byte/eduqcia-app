/**
 * Extrait les notes de bas de page depuis le HTML du contenu document.
 *
 * Les notes sont stockées comme marks TipTap : `<sup data-footnote="1" data-footnote-def="...">1</sup>`.
 * Cette fonction parse le HTML et retourne les définitions dans l'ordre des numéros.
 */

export type ExtractedFootnote = {
  noteId: number;
  definition: string;
};

const FOOTNOTE_REGEX = /<sup[^>]*data-footnote="(\d+)"[^>]*data-footnote-def="([^"]*)"[^>]*>/g;
const FOOTNOTE_REGEX_ALT = /<sup[^>]*data-footnote-def="([^"]*)"[^>]*data-footnote="(\d+)"[^>]*>/g;

export function extractFootnotes(html: string): ExtractedFootnote[] {
  const map = new Map<number, string>();

  // Essayer les deux ordres d'attributs
  for (const regex of [FOOTNOTE_REGEX, FOOTNOTE_REGEX_ALT]) {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(html)) !== null) {
      if (regex === FOOTNOTE_REGEX) {
        const id = Number(match[1]);
        const def = decodeHtmlEntities(match[2]);
        if (id > 0 && !map.has(id)) map.set(id, def);
      } else {
        const def = decodeHtmlEntities(match[1]);
        const id = Number(match[2]);
        if (id > 0 && !map.has(id)) map.set(id, def);
      }
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([noteId, definition]) => ({ noteId, definition }));
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}
