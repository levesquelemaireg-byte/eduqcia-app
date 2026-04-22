/** Word joiner (U+2060) — évite les coupures de ligne entre `(` / `)` et le texte adjacent (UAX #14). */
const WJ = "\u2060";

/**
 * Insère un word joiner après chaque `(` et avant chaque `)` ASCII pour qu’aucune parenthèse ne se retrouve
 * seule en fin ou début de ligne dans les cellules de barème (données JSON + grilles dédiées).
 */
export function tieAsciiParentheses(text: string): string {
  return text.replace(/\(/g, `(${WJ}`).replace(/\)/g, `${WJ})`);
}
