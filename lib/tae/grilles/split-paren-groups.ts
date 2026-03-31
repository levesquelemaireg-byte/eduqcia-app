export type GrilleParenSegment = { kind: "text"; value: string } | { kind: "paren"; value: string };

/**
 * Découpe une chaîne en segments texte / `(…)` ASCII sans parenthèses imbriquées.
 * Les données barème n’utilisent pas de `)` à l’intérieur d’un groupe.
 */
export function splitGrilleParenSegments(text: string): GrilleParenSegment[] {
  const segments: GrilleParenSegment[] = [];
  const re = /\([^)]+\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ kind: "text", value: text.slice(last, m.index) });
    }
    segments.push({ kind: "paren", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ kind: "text", value: text.slice(last) });
  }
  return segments.length > 0 ? segments : [{ kind: "text", value: text }];
}
